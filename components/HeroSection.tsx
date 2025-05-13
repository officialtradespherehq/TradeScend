import { ChevronRight, DollarSign, Shield, Users } from "lucide-react";
import MarketTrends from "./market-trends";
import MagneticButton from "./animations/magnetic-button";
import { useRouter } from "next/navigation";

export default function HeroSection () {
    const router = useRouter();
return (
<section data-hero-section className="py-12 md:py-24 relative overflow-hidden min-h-[90vh] flex items-center">
          {/* Video Background */}
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div className="absolute inset-0 bg-black/40 z-[1]"></div>
            <video
              className="absolute w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
            //   poster="/placeholder.svg?height=1080&width=1920"
            >
              <source
                src="https://videos.pexels.com/video-files/14003933/14003933-uhd_2560_1440_60fps.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="container flex flex-warp flex-col lg:flex-row justify-center gap-8 lg:gap-12 items-center mx-auto px-4 relative z-10">
            <div data-hero-content className="space-y-6 relative z-10 text-center lg:text-left w-full lg:w-1/2">
              <div className="inline-block px-4 py-1 bg-accent/20 border border-primary/30 rounded-full">
                <span className="text-secondary font-medium text-sm md:text-base">Trusted by 60,000+ investors</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Master the Markets with <span className="text-secondary">Confidence</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0">
                Copy trade from expert investors and earn daily returns on your investments with our secure and reliable
                platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <MagneticButton
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-accent bg-secondary rounded-md hover:bg-gold-dark transition-colors w-full sm:w-auto"
                  onClick={() => router.push("#plans")}
                >
                  Start Investing
                  <ChevronRight className="ml-2 h-5 w-5" />
                </MagneticButton>
                <MagneticButton
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors w-full sm:w-auto"
                  onClick={() => router.push("/register")}
                >
                  Create Account
                </MagneticButton>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-secondary" />
                  <span className="text-muted-foreground text-sm md:text-base">Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-secondary" />
                  <span className="text-muted-foreground text-sm md:text-base">Expert Traders</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-secondary" />
                  <span className="text-muted-foreground text-sm md:text-base">Daily Returns</span>
                </div>
              </div>
            </div>
            <div className="relative w-full lg:w-1/2">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-30"></div>
              <div className="relative bg-card/80 backdrop-blur-sm p-4 md:p-6 rounded-lg border border-border">
                <MarketTrends />
              </div>
            </div>
          </div>
        </section>
)
}