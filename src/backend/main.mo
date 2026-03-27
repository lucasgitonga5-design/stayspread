import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import Order "mo:core/Order";
import MixinStorage "blob-storage/Mixin";

actor {
  let promoterCounts = Map.empty<Principal, Nat>();
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    role : UserRole;
  };

  public type UserRole = {
    #host;
    #promoter;
    #traveler;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public type Progress = {
    current : Nat;
    total : Nat;
  };

  public type SavedListing = {
    id : Text;
    name : Text;
    images : [Storage.ExternalBlob];
    description : Text;
    price : Nat;
  };

  public type PropertyListing = {
    id : Text;
    name : Text;
    pricePerNight : Nat;
    host : Principal;
    images : [Storage.ExternalBlob];
    description : Text;
    amenities : [Text];
    location : Text;
  };

  module PropertyListing {
    public func compare(a : PropertyListing, b : PropertyListing) : Order.Order {
      compareByPrice(a, b);
    };

    public func compareByPrice(a : PropertyListing, b : PropertyListing) : Order.Order {
      Nat.compare(a.pricePerNight, b.pricePerNight);
    };
  };

  public type Promoter = {
    id : Principal;
    referralCode : Text;
    listings : ?[SavedListing];
  };

  public type Booking = {
    id : Text;
    listing : PropertyListing;
    traveler : Principal;
    promoterCode : ?Text;
    checkIn : Time.Time;
    checkOut : Time.Time;
    totalPrice : Nat;
    paymentIntentId : Text;
  };

  let listings = Map.empty<Text, PropertyListing>();
  let promoters = Map.empty<Principal, Promoter>();
  var bookings : [Booking] = [];

  // Map from Stripe session ID to the traveler principal who created it
  let sessionOwners = Map.empty<Text, Principal>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  func hasUserRole(caller : Principal, role : UserRole) : Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return false;
    };
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.role == role };
    };
  };

  public query func getListingsByPriceLowToHigh() : async [PropertyListing] {
    listings.values().toArray().sort(PropertyListing.compareByPrice);
  };

  public shared ({ caller }) func createListing(listing : PropertyListing) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create listings");
    };
    if (not hasUserRole(caller, #host)) {
      Runtime.trap("Unauthorized: Only hosts can create listings");
    };
    if (listing.host != caller) {
      Runtime.trap("Unauthorized: Cannot create listing for another host");
    };
    if (listings.containsKey(listing.id)) {
      Runtime.trap("Listing with this ID already exists");
    };
    listings.add(listing.id, listing);
  };

  public shared ({ caller }) func updateListing(listing : PropertyListing) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update listings");
    };
    if (not hasUserRole(caller, #host)) {
      Runtime.trap("Unauthorized: Only hosts can update listings");
    };

    switch (listings.get(listing.id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?existingListing) {
        if (existingListing.host != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own listings");
        };
      };
    };

    if (listing.host != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot change listing host");
    };

    listings.add(listing.id, listing);
  };

  public shared ({ caller }) func deleteListing(listingId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete listings");
    };

    switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) {
        if (listing.host != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own listings");
        };
      };
    };

    listings.remove(listingId);
  };

  public shared ({ caller }) func getPromoterReferralCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get referral code");
    };
    if (not hasUserRole(caller, #promoter)) {
      Runtime.trap("Unauthorized: Only promoters can get referral code");
    };

    switch (promoters.get(caller)) {
      case (null) {
        let code = "PROMO-" # caller.toText();
        let promoter = { id = caller; referralCode = code; listings = null };
        promoters.add(caller, promoter);
        code;
      };
      case (?promoter) { promoter.referralCode };
    };
  };

  public shared ({ caller }) func addSavedListing(listing : SavedListing) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add listings");
    };
    if (not hasUserRole(caller, #promoter)) {
      Runtime.trap("Unauthorized: Only promoters can add listings");
    };

    switch (promoters.get(caller)) {
      case (null) { Runtime.trap("Promoter not found") };
      case (?promoter) {
        var listingsArray = switch (promoter.listings) {
          case (null) { [] };
          case (?current) { current };
        };
        listingsArray := listingsArray.concat([listing]);
        promoters.add(caller, { promoter with listings = ?listingsArray });
      };
    };
  };

  public shared ({ caller }) func createBooking(listingId : Text, checkIn : Time.Time, checkOut : Time.Time, promoterCode : ?Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create bookings");
    };

    let listing = switch (listings.get(listingId)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) { l };
    };

    let days = 1;
    let totalPrice = listing.pricePerNight * days;

    let booking = {
      id = Time.now().toText();
      listing;
      traveler = caller;
      promoterCode;
      checkIn;
      checkOut;
      totalPrice;
      paymentIntentId = "";
    };

    bookings := bookings.concat([booking]);
    promoterCounts.add(caller, 1);

    booking.id;
  };

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can configure Stripe");
    };
    stripeConfig := ?config;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?config) { config };
    };
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checkout sessions");
    };
    let sessionId = await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
    sessionOwners.add(sessionId, caller);
    sessionId;
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can retrieve session status");
    };
    // Only the session owner or an admin may query the session status
    switch (sessionOwners.get(sessionId)) {
      case (null) {
        // Session owner not recorded; restrict to admins only
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot retrieve status for an unknown session");
        };
      };
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only retrieve status for your own session");
        };
      };
    };
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };
};
