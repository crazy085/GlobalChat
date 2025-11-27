import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, User, Lock, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setIsLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: username.trim(),
          password: password.trim(),
        }),
      });

      if (response.ok) {
        const { user } = await response.json();
        localStorage.setItem("userId", user.id);
        localStorage.setItem("username", user.username);
        setLocation("/");
      } else {
        const { error } = await response.json();
        toast({
          variant: "destructive",
          title: isLogin ? "Login failed" : "Registration failed",
          description: error || "Please try again",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 gradient-bg relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      {/* Main card */}
      <div className="w-full max-w-md fade-in relative z-10">
        <div className="glass rounded-3xl p-8 hover-lift">
          {/* Logo section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/50 rounded-2xl blur-xl animate-pulse" />
                <div className="relative gradient-primary p-4 rounded-2xl glow">
                  <MessageCircle className="h-10 w-10 text-white" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isLogin ? "Welcome Back" : "Join Us"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin 
                ? "Sign in to continue your conversations" 
                : "Create an account to start chatting"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoFocus
                data-testid="input-username"
                className="h-14 text-base pl-12 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Password input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                data-testid="input-password"
                className="h-14 text-base pl-12 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full h-14 text-base font-semibold gradient-primary border-0 rounded-xl hover-glow transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading || !username.trim() || !password.trim()}
              data-testid="button-submit"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-transparent text-muted-foreground">or</span>
              </div>
            </div>

            {/* Toggle mode */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                disabled={isLoading}
                data-testid="button-toggle-mode"
                className="text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              >
                {isLogin 
                  ? "Don't have an account? " 
                  : "Already have an account? "}
                <span className="font-semibold text-primary hover:underline">
                  {isLogin ? "Sign up" : "Sign in"}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Secure • Private • Fast
        </p>
      </div>
    </div>
  );
}
