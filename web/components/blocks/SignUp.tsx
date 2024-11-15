"use client";
import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Label } from "../ui/label";
import { Input } from "../aceternity/input";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import pb from "@/lib/db/pocket_base.config";

type FormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function SignupFormDemo() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
  } = useForm<FormData>();
  console.log(1);
  console.log(pb);
  const [error, setErrorState] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  console.log(2);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log(3);
    // Check if the passwords match before submitting
    if (data.password !== data.confirmPassword) {
      console.log(4);
      setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }
    console.log(5);

    // Validate email format using a regex
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    console.log(6);
    if (!emailRegex.test(data.email)) {
      setError("email", {
        type: "manual",
        message: "Invalid email address",
      });
      return;
    }

    console.log(2);
    // Prepare the data for user creation
    const userData = {
      username: data.username,
      email: data.email,
      password: data.password,
      passwordConfirm: data.confirmPassword,
    };

    try {
      console.log(1);
      setErrorState(null); // Clear previous errors
      console.log(2);

      // Create user in PocketBase
      const record = await pb.collection("users").create(userData);
      console.log(3);

      setSuccess("Signup successful! Redirecting...");
      console.log(4);
      setTimeout(() => {
        window.location.href = "/user"; // Redirect to login page after success
        console.log(5);
      }, 2000);
    } catch (err: any) {
      setErrorState(err.message || "Signup failed. Please try again.");
    }
  };

  // Watch password to check if confirm password matches
  const password = watch("password");

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <div className="flex items-center mb-4 cursor-pointer" onClick={() => window.history.back()}>
        <ChevronLeft className="h-6 w-6 text-neutral-800 dark:text-neutral-300" />
        <span className="text-neutral-700 dark:text-neutral-300 text-sm">Back</span>
      </div>
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Sign Up to <span className="text-primary">TubeTalk</span>
      </h2>

      <form className="my-8" onSubmit={handleSubmit(onSubmit)}>
        {/* Username */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            placeholder="Enter your username"
            type="text"
            {...register("username", { required: "Username is required" })}
          />
          {errors.username && <ErrorText message={errors.username.message} />}
        </LabelInputContainer>

        {/* Email */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            placeholder="Enter your email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Enter a valid email address",
              },
            })}
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
              minLength: { value: 6, message: "Password must be at least 6 characters long" },
            })}
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
                value === password || "Passwords do not match",
            })}
          />
          {errors.confirmPassword && (
            <ErrorText message={errors.confirmPassword.message} />
          )}
        </LabelInputContainer>

        {/* Display Errors */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

        <button
          className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          type="submit"
        >
          Sign up &rarr;
          <BottomGradient />
        </button>

        <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

// Helper Components
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

