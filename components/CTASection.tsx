import { ChevronRight } from "lucide-react";
import MagneticButton from "./animations/magnetic-button";
import { useRouter } from "next/navigation";

export default function CTASection () {
    const router = useRouter()
    
return (
    <section className="py-16 md:py-24">
    <div className="container mx-auto px-4">
      <div className="bg-gradient-to-r from-primary-foreground to-primary rounded-2xl p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Start Your Investment Journey?</h2>
            <p className="text-white/80 text-lg">
              Join our platform today and start earning daily returns on your investments. Our expert traders are
              ready to help you grow your wealth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <MagneticButton
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-accent bg-secondary rounded-md hover:bg-gold-dark transition-colors"
                onClick={() => router.push("/register")}
              >
                Create Account
                <ChevronRight className="ml-2 h-5 w-5" />
              </MagneticButton>
              <MagneticButton
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-white/10 rounded-md hover:bg-white/20 transition-colors"
                onClick={() => router.push("/contact")}
              >
                Contact Sales
              </MagneticButton>
            </div>
          </div>
          <div className="bg-white/10 p-6 rounded-lg">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Start with just $1,000</h3>
              <p className="text-white/80">
                Enter your email to receive our investment guide and learn how to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-white/50 flex-1 focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <MagneticButton
                  className="px-4 py-3 bg-secondary text-accent font-medium rounded-md hover:bg-gold-dark transition-colors"
                  onClick={() => router.push("/register")}
                >
                  Get Started
                </MagneticButton>
              </div>
              <p className="text-white/60 text-sm">
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)
}