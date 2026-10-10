"use client";

import useRevealHeading from "../hooks/useRevealHeading";
import useRevealUp from "../hooks/useRevealUp";
import useSplitReveal from "../hooks/useSplitReveal";

export default function AnimationProvider() {
    useRevealHeading();
    useRevealUp();
    useSplitReveal();

    return null;
}