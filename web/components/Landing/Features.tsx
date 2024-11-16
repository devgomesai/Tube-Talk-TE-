import { CalendarIcon, FileTextIcon } from "@radix-ui/react-icons";
import { BellIcon, Blocks, Bot, ClipboardCheck, Share2Icon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";

const features = [
  {
    Icon: FileTextIcon,
    name: "Insights from Videos",
    description: "Get the summary of the video in a click",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute right-2 top-4 h-[300px] w-full border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
  },
  {
    Icon: Bot,
    name: "ChatBot Integration",
    description: "Ask questions on the video and get answers instantly.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute right-2 top-4 h-[300px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
  },
  {
    Icon: Blocks,
    name: "We are where you are",
    description: "Through chrome extension, access the insights wherever you are.",
    className: "col-span-3 lg:col-span-2",
    href: "#",
    cta: "Learn more",
    background: (
      <Calendar
        mode="single"
        selected={new Date(2022, 4, 11, 0, 0, 0)}
        className="absolute right-0 top-10 origin-top rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-105"
      />
    ),
  },
  {
    Icon: ClipboardCheck,
    name: "Quizzes",
    description: "Test your knowledge with quizzes.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute right-2 top-4 h-[300px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
  },
];

export default function Features() {
  return (
    <>
      <h1 id="features" className="text-4xl font-bold text-center mt-32">Whats In TubeTalk? <span className="text-xl font-normal text-muted-foreground"> Everything You Need from a video at your fingertips</span></h1>
      <BentoGrid className="p-16">
        {features.map((feature, idx) => (
          <BentoCard key={idx} {...feature} />
        ))}
      </BentoGrid>
    </>
  );
}
