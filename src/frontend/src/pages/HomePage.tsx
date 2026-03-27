import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  DollarSign,
  Globe,
  Megaphone,
  TrendingUp,
  Users,
} from "lucide-react";
import ListingCard from "../components/ListingCard";
import { useGetListingsByPrice } from "../hooks/useListings";

export default function HomePage() {
  const { data: listings = [] } = useGetListingsByPrice();
  const featuredListings = listings.slice(0, 6);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        className="relative py-24 md:py-32 bg-cover bg-center"
        style={{
          backgroundImage: "url(/assets/generated/hero-bg.dim_1920x1080.png)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-background/70" />
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Turn Every Traveler Into a Travel Agent
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Airbnb spent $1 Billion on ads last year. StaySpread replaces
              those ads with real people. Share amazing stays and earn
              commissions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/host-dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  <Building2 className="mr-2 h-5 w-5" />
                  List Your Property
                </Button>
              </Link>
              <Link to="/promoter-dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Megaphone className="mr-2 h-5 w-5" />
                  Become a Promoter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How StaySpread Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple ways to participate in the travel revolution
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">Hosts</h3>
                <p className="text-muted-foreground text-center">
                  List your property and let promoters market it for you. Keep
                  82% of every booking.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Megaphone className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">
                  Promoters
                </h3>
                <p className="text-muted-foreground text-center">
                  Share properties you love and earn 8% commission on every
                  booking through your link.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex justify-center">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2 text-center">
                  Travelers
                </h3>
                <p className="text-muted-foreground text-center">
                  Discover amazing stays recommended by real people. Book with
                  confidence.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Featured Properties
                </h2>
                <p className="text-muted-foreground">
                  Discover amazing stays around the world
                </p>
              </div>
              <Link to="/listings">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex justify-center mb-4">
                <DollarSign className="h-12 w-12 text-primary" />
              </div>
              <div className="text-4xl font-bold mb-2">8%</div>
              <p className="text-muted-foreground">Commission for Promoters</p>
            </div>
            <div>
              <div className="flex justify-center mb-4">
                <TrendingUp className="h-12 w-12 text-primary" />
              </div>
              <div className="text-4xl font-bold mb-2">82%</div>
              <p className="text-muted-foreground">Payout to Hosts</p>
            </div>
            <div>
              <div className="flex justify-center mb-4">
                <Globe className="h-12 w-12 text-primary" />
              </div>
              <div className="text-4xl font-bold mb-2">Global</div>
              <p className="text-muted-foreground">Reach Worldwide</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
