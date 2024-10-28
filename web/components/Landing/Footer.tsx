import { IconBrandGithub } from "@tabler/icons-react";
import Link from "next/link";
import { Separator } from "../ui/separator";

export default function Footer() {
  return (
    <>
      <Separator />
      <footer className="bg-[var(--background)] py-6 w-full">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-[var(--foreground-muted)]">&copy; 2024 Acme Inc. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
          </div>
        </div>
      </footer>
    </>
  );
}
