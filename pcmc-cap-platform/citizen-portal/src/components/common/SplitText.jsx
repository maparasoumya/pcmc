import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText as GSAPSplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, GSAPSplitText);

const SplitText = ({
  text,
  className = "",
  delay = 50,
  duration = 1.25,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  textAlign = "center",
  tag = "p"
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !text) return;

    const element = ref.current;

    const split = new GSAPSplitText(element, {
      type: splitType,
      charsClass: "split-char",
      wordsClass: "split-word",
      linesClass: "split-line"
    });

    let targets = split.chars;

    if (splitType.includes("words")) {
      targets = split.words;
    }

    if (splitType.includes("lines")) {
      targets = split.lines;
    }

    gsap.fromTo(
      targets,
      from,
      {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        scrollTrigger: {
          trigger: element,
          start: "top 90%",
          once: true
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });

      split.revert();
    };
  }, [
    text,
    delay,
    duration,
    ease,
    splitType, from, to
  ]);

  const Tag = tag || "p";

  return (
    <Tag
      ref={ref}
      className={`split-parent ${className}`}
      style={{
        textAlign,
        overflow: "hidden",
        display: "inline-block"
      }}
    >
      {text}
    </Tag>
  );
};

export default SplitText;