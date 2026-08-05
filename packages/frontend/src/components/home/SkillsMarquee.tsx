'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  SiReact, SiAngular, SiNextdotjs, SiTypescript, SiJavascript, 
  SiNodedotjs, SiTailwindcss, SiBootstrap, SiMongodb, SiMysql, 
  SiPhp, SiGithub, SiPostman, SiGraphql, SiGit, 
  SiPython, SiHtml5, SiExpress, SiDocker, 
  SiRedux, SiNestjs, SiSass, SiFirebase, SiVercel 
} from 'react-icons/si';
import { FaDatabase, FaCode, FaRobot, FaBrain, FaLaptopCode, FaServer } from 'react-icons/fa';

interface SkillItem {
  _id?: string;
  name: string;
  category: string;
  proficiency: number;
  icon?: string;
  featured?: boolean;
  order?: number;
}

interface SkillsMarqueeProps {
  skills?: SkillItem[];
}

const defaultSkills: SkillItem[] = [
  { name: 'Angular', category: 'Frameworks & Libraries', proficiency: 90, icon: 'SiAngular' },
  { name: 'React.js', category: 'Frameworks & Libraries', proficiency: 85, icon: 'SiReact' },
  { name: 'Next.js', category: 'Frameworks & Libraries', proficiency: 80, icon: 'SiNextdotjs' },
  { name: 'JavaScript', category: 'Languages', proficiency: 92, icon: 'SiJavascript' },
  { name: 'TypeScript', category: 'Languages', proficiency: 88, icon: 'SiTypescript' },
  { name: 'HTML5 & CSS3', category: 'Languages', proficiency: 95, icon: 'SiHtml5' },
  { name: 'Cursor AI', category: 'AI Tools & Databases', proficiency: 90, icon: 'SiOpenai' },
  { name: 'MongoDB', category: 'AI Tools & Databases', proficiency: 72, icon: 'SiMongodb' },
  { name: 'REST APIs', category: 'AI Tools & Databases', proficiency: 90, icon: 'SiPostman' }
];

const getSkillIcon = (iconName?: string) => {
  if (!iconName) return <FaCode className="w-4 h-4 text-primary" />;

  const map: Record<string, React.ReactNode> = {
    siangular: <SiAngular className="w-4 h-4 text-red-500" />,
    sireact: <SiReact className="w-4 h-4 text-cyan-400" />,
    sinextdotjs: <SiNextdotjs className="w-4 h-4 text-foreground" />,
    sitypescript: <SiTypescript className="w-4 h-4 text-blue-500" />,
    sijavascript: <SiJavascript className="w-4 h-4 text-yellow-400" />,
    sinodedotjs: <SiNodedotjs className="w-4 h-4 text-green-500" />,
    sitailwindcss: <SiTailwindcss className="w-4 h-4 text-cyan-400" />,
    sibootstrap: <SiBootstrap className="w-4 h-4 text-purple-500" />,
    simongodb: <SiMongodb className="w-4 h-4 text-green-500" />,
    simysql: <SiMysql className="w-4 h-4 text-blue-400" />,
    siphp: <SiPhp className="w-4 h-4 text-indigo-400" />,
    siopenai: <FaRobot className="w-4 h-4 text-emerald-400" />,
    sigithub: <SiGithub className="w-4 h-4 text-foreground" />,
    sipostman: <SiPostman className="w-4 h-4 text-orange-500" />,
    sigraphql: <SiGraphql className="w-4 h-4 text-pink-500" />,
    sigit: <SiGit className="w-4 h-4 text-orange-600" />,
    sipython: <SiPython className="w-4 h-4 text-yellow-500" />,
    sihtml5: <SiHtml5 className="w-4 h-4 text-orange-500" />,
    sicss3: <SiHtml5 className="w-4 h-4 text-blue-500" />,
    siexpress: <SiExpress className="w-4 h-4 text-foreground" />,
    sidocker: <SiDocker className="w-4 h-4 text-blue-400" />,
    siamazonaws: <FaServer className="w-4 h-4 text-orange-400" />,
    siredux: <SiRedux className="w-4 h-4 text-purple-500" />,
    sinestjs: <SiNestjs className="w-4 h-4 text-red-500" />,
    sisass: <SiSass className="w-4 h-4 text-pink-400" />,
    sifirebase: <SiFirebase className="w-4 h-4 text-amber-500" />,
    sivercel: <SiVercel className="w-4 h-4 text-foreground" />,
    fadatabase: <FaDatabase className="w-4 h-4 text-blue-500" />,
    facode: <FaCode className="w-4 h-4 text-primary" />,
    farobot: <FaRobot className="w-4 h-4 text-amber-500" />,
    fabrain: <FaBrain className="w-4 h-4 text-purple-500" />,
    falaptopcode: <FaLaptopCode className="w-4 h-4 text-primary" />,
    faserver: <FaServer className="w-4 h-4 text-slate-500" />
  };

  return map[iconName.toLowerCase()] || <FaCode className="w-4 h-4 text-primary" />;
};

export default function SkillsMarquee({ skills }: SkillsMarqueeProps) {
  const activeSkills = skills && skills.length > 0 ? skills : defaultSkills;

  // Duplicate items for infinite rolling marquee effect
  const marqueeItems = [...activeSkills, ...activeSkills, ...activeSkills];

  // Group active skills by category
  const groupedCategories = activeSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, SkillItem[]>);

  return (
    <section id="skills" className="py-24 w-full overflow-hidden bg-card/5 border-y border-border/40">
      <div className="max-w-6xl mx-auto px-6 mb-16 text-center md:text-left">
        <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
          Technical Arsenal
        </h2>
        <p className="font-sans text-base text-muted-foreground max-w-xl leading-relaxed">
          Languages, frameworks, and tools I use to bring modern applications to life.
        </p>
      </div>

      {/* Infinite Horizontal Rolling Marquee using Framer Motion */}
      <div className="relative flex overflow-x-hidden w-full py-4 border-y border-border/25 bg-muted/10">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            ease: 'linear',
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          className="flex whitespace-nowrap gap-12 text-sm font-mono tracking-widest font-black uppercase text-muted-foreground/75"
        >
          {marqueeItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 select-none hover-glow-trigger">
              {getSkillIcon(item.icon)}
              <span>{item.name}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Categorized Proficiencies Grid Layout */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full">
        {Object.entries(groupedCategories).map(([categoryName, categorySkills]) => (
          <div 
            key={categoryName} 
            className="p-6 rounded-xl border border-border bg-card/20 text-left hover:border-primary/10 transition-colors hover-glow-trigger"
          >
            <h3 className="font-display text-lg font-bold text-foreground mb-6 pb-2 border-b border-border/30">
              {categoryName}
            </h3>
            
            <div className="space-y-4">
              {categorySkills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                    <div className="flex items-center gap-2">
                      {getSkillIcon(skill.icon)}
                      <span className="text-foreground">{skill.name}</span>
                    </div>
                    <span className="text-primary">{skill.proficiency}%</span>
                  </div>
                  {/* Progress track */}
                  <div className="w-full h-1.5 rounded-full bg-border/50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000"
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
