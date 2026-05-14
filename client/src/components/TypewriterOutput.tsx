import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypewriterOutputProps {
  text: string;
  isStreaming?: boolean;
}

export function TypewriterOutput({ text, isStreaming }: TypewriterOutputProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset when text changes drastically (new prompt)
  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      setCurrentIndex(0);
      return;
    }
    
    // If we're not starting from 0, maybe we just want to show it all immediately if it's history
    // But for this effect, let's just animate if it's fresh. 
    // Simplified: animate chunks if index < length
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        // Typing speed varies slightly for realism
        const char = text[currentIndex];
        
        // Add chunk size variability - type faster for spaces or common chars
        // INCREASED SPEED for Farsi compatibility and better UX
        const increment = Math.random() > 0.6 ? 5 : 2; 
        
        setDisplayedText(prev => prev + text.slice(currentIndex, currentIndex + increment));
        setCurrentIndex(prev => prev + increment);
      }, 5);
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  // Parse text into sections if possible
  const sections = parseSections(displayedText);

  if (sections.length > 0) {
    return (
      <div className="space-y-6 font-mono text-sm md:text-base leading-relaxed text-foreground/90">
        {sections.map((section, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border-l-2 border-primary/20 pl-4 py-1"
          >
            <h3 className="text-primary font-bold mb-2 uppercase text-xs tracking-wider opacity-70">
              {section.title}
            </h3>
            <div className="whitespace-pre-wrap">{section.content}</div>
          </motion.div>
        ))}
        {currentIndex < text.length && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-middle" />
        )}
      </div>
    );
  }

  return (
    <div className="font-mono text-sm md:text-base leading-relaxed whitespace-pre-wrap text-foreground/90">
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-middle" />
      )}
    </div>
  );
}

// Simple parser for the standard format
function parseSections(text: string) {
  const titles = ["Role", "Context", "Task", "Constraints", "Output Format", "Role:", "Context:", "Task:", "Constraints:", "Output Format:"];
  
  // This is a naive client-side parser just for visual structure
  // It won't be perfect for streaming content but works for completed text
  const lines = text.split('\n');
  const sections: { title: string, content: string }[] = [];
  let currentTitle = "";
  let currentContent: string[] = [];

  const flush = () => {
    if (currentTitle) {
      sections.push({ title: currentTitle, content: currentContent.join('\n').trim() });
    } else if (currentContent.length > 0) {
       // content before any header
       sections.push({ title: "PREAMBLE", content: currentContent.join('\n').trim() });
    }
    currentContent = [];
  };

  for (const line of lines) {
    const matchedTitle = titles.find(t => line.trim().startsWith(`**${t}**`) || line.trim().startsWith(`### ${t}`) || line.trim() === t || line.trim() === `**${t}**`);
    
    if (matchedTitle) {
      flush();
      currentTitle = matchedTitle.replace(/\*|#/g, '').replace(':', '');
    } else {
      currentContent.push(line);
    }
  }
  flush();

  return sections;
}
