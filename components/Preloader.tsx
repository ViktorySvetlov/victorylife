"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Preloader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setShow(false), 1250);
    return () => clearTimeout(id);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#f5f5f7]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          <motion.div
            initial={{ scale: .82, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="relative flex h-28 w-28 items-center justify-center rounded-[36px] bg-white shadow-soft"
          >
            <Image src="/logo/victorylife-logo.png" alt="VictoryLife" width={76} height={76} priority />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .25 }}
            className="mt-6 text-xl font-bold tracking-tight"
          >
            Начинай побеждать!
          </motion.p>
          <motion.div
            className="mt-5 h-1.5 w-44 overflow-hidden rounded-full bg-neutral-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full rounded-full bg-[#0A84FF]"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.05, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
