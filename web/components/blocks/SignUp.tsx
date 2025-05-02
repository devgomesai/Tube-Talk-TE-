"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Label } from "../ui/label"; // Assuming these imports are correct
import { Input } from "../aceternity/input"; // Assuming these imports are correct
import { cn } from "@/lib/utils"; // Assuming this import is correct
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import pb from "@/lib/db/pocket_base.config"; // Assuming this import is correct
import { useRouter } from "next/navigation";

type FormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function SignupFormDemo() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    // setError is removed as react-hook-form handles field errors automatically now
  } = useForm<FormData>({
    mode: "onBlur", // Validate fields when they lose focus for better UX
  });

  // State for general API errors (not field-specific validation errors)
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add loading state

  // Watch password to validate confirmPassword
  const password = watch("password");

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true); // Set loading state
    setApiError(null); // Clear previous API errors
    setSuccess(null);  // Clear previous success messages

    // Note: Password match and email format validation are now handled by react-hook-form rules below.
    // No need for manual checks here.

    const userData = {
      username: data.username,
      email: data.email,
      emailVisibility: true, // Often needed by PocketBase, adjust if necessary
      password: data.password,
      passwordConfirm: data.confirmPassword,
      // Add any other default fields you need for your 'users' collection
      // e.g., name: data.username
    };

    try {
      // 1. Create the user in PocketBase
      console.log("Attempting to create user:", userData.username);
      const record = await pb.collection("users").create(userData);
      console.log("User created successfully:", record.id);

      // 2. Log the user in immediately after creation
      console.log("Attempting to log in user:", data.email);
      await pb.collection("users").authWithPassword(data.email, data.password);
      console.log("User logged in successfully.");
      // PocketBase JS SDK automatically stores the auth token in pb.authStore

      setSuccess("Signup successful! Logging in and redirecting...");

      // 3. Redirect after a short delay
      setTimeout(() => {
        // Use router.push for client-side navigation in Next.js
        router.push("/"); // Redirect to home page (or dashboard) after login
        console.log("Redirecting to /");
      }, 2000);

    } catch (err: any) {
      console.error("Signup or Login failed:", err);
      // Provide a user-friendly error message
      // PocketBase often returns errors in err.data.data or err.message
      const pbError = err?.data?.data;
      let errorMessage = "Signup failed. Please try again."; // Default message

      if (pbError) {
        // Check for specific PocketBase validation errors
        const fieldErrors = Object.keys(pbError);
        if (fieldErrors.length > 0) {
          // Example: Prioritize username or email errors if they exist
          if (pbError.username) {
            errorMessage = `Username error: ${pbError.username.message}`;
          } else if (pbError.email) {
            errorMessage = `Email error: ${pbError.email.message}`;
          } else {
            // Generic message from the first field error found
            errorMessage = `${fieldErrors[0]}: ${pbError[fieldErrors[0]].message}`;
          }
        } else if (err.message) {
          errorMessage = err.message; // Use generic message if no field errors
        }
      } else if (err.message) {
        errorMessage = err.message; // Fallback to generic error message
      }

      setApiError(errorMessage);
      setIsSubmitting(false); // Reset loading state on error
    }
    // No need to set isSubmitting(false) on success because of the redirect
  };


  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <div className="flex items-center mb-4 cursor-pointer" onClick={() => router.push("/")}>
        <ChevronLeft className="h-6 w-6 text-neutral-800 dark:text-neutral-300" />
        <span className="text-neutral-700 dark:text-neutral-300 text-sm">Home</span>
      </div>
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Sign Up to <span className="text-primary">TubeTalk</span> {/* Adjust 'TubeTalk' and 'primary' class if needed */}
      </h2>

      <form className="my-8" onSubmit={handleSubmit(onSubmit)}>
        {/* Username */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="your_unique_username"
            type="text"
            {...register("username", {
              required: "Username is required",
              minLength: { value: 3, message: "Username must be at least 3 characters" },
              // Add pattern if you have specific username rules (e.g., alphanumeric)
              // pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Username can only contain letters, numbers, and underscores" }
            })}
            disabled={isSubmitting} // Disable input while submitting
          />
          {errors.username && <ErrorText message={errors.username.message} />}
        </LabelInputContainer>

        {/* Email */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            placeholder="you@example.com"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                // Standard robust email regex
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Enter a valid email address",
              },
            })}
            disabled={isSubmitting}
          />
          {errors.email && <ErrorText message={errors.email.message} />}
        </LabelInputContainer>

        {/* Password */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="••••••••"
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters long" }, // PocketBase default is 8
              // You might want to add more complex password requirements here using a pattern
            })}
            disabled={isSubmitting}
          />
          {errors.password && <ErrorText message={errors.password.message} />}
        </LabelInputContainer>

        {/* Confirm Password */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            placeholder="••••••••"
            type="password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match", // Validation depends on the watched 'password'
            })}
            disabled={isSubmitting}
          />
          {errors.confirmPassword && (
            <ErrorText message={errors.confirmPassword.message} />
          )}
        </LabelInputContainer>

        {/* Display API Errors and Success Messages */}
        {apiError && <p className="text-red-500 text-sm mb-4">{apiError}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

        <button
          className={cn(
            "bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]",
            "disabled:opacity-50 disabled:cursor-not-allowed" // Style for disabled state
          )}
          type="submit"
          disabled={isSubmitting} // Disable button while submitting
        >
          {isSubmitting ? "Signing up..." : "Sign up"} &rarr;
          <BottomGradient />
        </button>

        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline"> {/* Adjust '/auth/login' path if needed */}
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

// Helper Components (Keep these as they are)
const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-rose-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

const ErrorText = ({ message }: { message?: string }) => (
  <span className="text-red-500 text-sm">{message}</span>
);
