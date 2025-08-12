import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { profilePhotoAPI } from "@/lib/api";
import Spline from "@splinetool/react-spline";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    city: "",
    country: "",
    email: "",
    password: "",
    description: "",
  });
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"user" | "admin">("user");
  const [step, setStep] = useState<"choose" | "form">("choose");

  const navigate = useNavigate();
  const { toast } = useToast();

  // Upload selected photo file to Cloudinary
  const uploadPhotoToCloudinary = async (file: File) => {
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        // For now, just store the base64 data
        // We'll handle the actual upload after signup
        setPhotoUrl(base64);
        toast({
          title: "Photo Selected! 📸",
          description: "Photo will be uploaded after account creation",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to process photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle form input changes and photo upload trigger
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement & {
      files: FileList;
    };
    if (files && files.length > 0) {
      if (name === "photo") {
        uploadPhotoToCloudinary(files[0]);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Continue after choosing role
  const handleContinue = () => {
    if (role === "admin") {
      navigate("/admin-signup");
      return;
    }
    setStep("form");
  };

  // Submit form to backend, including photo URL
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "admin") {
      navigate("/admin-signup");
      return;
    }
    setLoading(true);
    try {
      const bodyData = {
        ...formData,
        photo: photoUrl,
      };
      const res = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json();
      if (res.ok) {
        
        // If we have a photo URL, upload it to Cloudinary
        if (photoUrl && photoUrl.startsWith('data:')) {
          try {
            const photoResponse = await fetch("http://localhost:3000/profile/photo/upload", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${data.token || ''}`,
              },
              body: JSON.stringify({ photoUrl }),
            });
            
            if (photoResponse.ok) {
              toast({
                title: "Account Created! 🎉",
                description: "Your account and profile photo have been created successfully!",
              });
            } else {
              toast({
                title: "Account Created! 🎉",
                description: "Account created successfully, but photo upload failed. You can add a photo later.",
              });
            }
          } catch (photoError) {
            console.error("Photo upload error:", photoError);
            toast({
              title: "Account Created! 🎉",
              description: "Account created successfully, but photo upload failed. You can add a photo later.",
            });
          }
        } else {
          toast({
            title: "Account Created! 🎉",
            description: "Your account has been created successfully. Please log in.",
          });
        }
        
        localStorage.setItem("justSignedUp", "true");
        navigate("/login");
      } else {
        toast({
          title: "Signup Failed",
          description: data.message || "Signup failed. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Connection Error",
        description: "Error connecting to server. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex">
      {/* Left side - Signup Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-xl text-[#d3d3ff]">
          <CardHeader>
            <CardTitle>Register</CardTitle>
          </CardHeader>
          <CardContent>
            {/* STEP 1: Choose role */}
            {step === "choose" && (
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm">Sign up as</label>
                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as "user" | "admin")
                    }
                    className="w-full bg-black border border-[#E6E6FA]/40 rounded px-3 py-2"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <Button
                  onClick={handleContinue}
                  className="w-full bg-[#E6E6FA] text-black hover:bg-[#E6E6FA]/80"
                >
                  Continue
                </Button>
              </div>
            )}

            {/* STEP 2: Signup form */}
            {step === "form" && (
              <form onSubmit={onSubmit} className="space-y-4">
                {/* Photo Pickup and Preview */}
                <div className="flex flex-col items-center">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full mb-4 object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 cursor-pointer">
                      <span className="text-sm text-gray-500">Photo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    name="photo"
                    onChange={handleChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer text-sm text-[#E6E6FA] underline hover:text-[#b6b6ff]"
                  >
                    {photoUrl ? "Change Photo" : "Upload Photo"}
                  </label>
                </div>

                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    placeholder="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Age / Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full bg-black border border-[#E6E6FA]/40 rounded px-3 py-2 text-[#d3d3ff]"
                  >
                    <option value="" disabled>
                      Select Gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* City / Country */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    placeholder="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email / Password */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="email"
                    placeholder="Email Address"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Additional Information */}
                <Textarea
                  placeholder="Additional Information..."
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />

                <Button
                  type="submit"
                  variant="default"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right side - Spline */}
      <div className="hidden md:block w-1/2 h-screen">
        <Spline
          scene="https://prod.spline.design/RJpSCkoPCHxfmSjY/scene.splinecode"
          className="w-full h-full"
        />
      </div>
    </main>
  );
};

export default Signup;
