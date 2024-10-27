import { ContainerScroll } from "../aceternity/container-scroll-animation";
import HeroVideoDialog from "../magicui/hero-video-dialog";
import ShineBorder from "../magicui/shine-border";

export default function ExplanationVideo() {
  return (
    <div className="relative pt-12 md:pt-16 lg:pt-24 pb-20 px-4 sm:px-6 lg:px-8 z-30">

      <ContainerScroll>
        <ShineBorder
          className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-background md:shadow-xl"
          color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
        >
          <div className="w-full overflow-hidden rounded-t-3xl border-t border-border/40 bg-muted/30 backdrop-blur-sm shadow-xl">
            <HeroVideoDialog
              className="w-full aspect-video"
              animationStyle="from-center"
              videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
              thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
              thumbnailAlt="Hero Video"
            />
          </div>
        </ShineBorder>
      </ContainerScroll>
    </div>
  )
}
