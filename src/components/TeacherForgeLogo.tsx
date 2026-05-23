import Svg, { Path } from "react-native-svg";

type TeacherForgeLogoProps = {
  color?: string;
  size?: number;
};

export function TeacherForgeLogo({
  color = "#3b82f6",
  size = 44
}: TeacherForgeLogoProps) {
  return (
    <Svg
      accessibilityLabel="TeacherForge logo"
      fill="none"
      height={size}
      viewBox="0 0 64 64"
      width={size}
    >
      <Path
        d="M32 19c-7.1-3.7-14.2-4.3-21-3.4v27.9c6.8-.9 13.9-.3 21 3.4V19Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
      />
      <Path
        d="M32 19c7.1-3.7 14.2-4.3 21-3.4v27.9c-6.8-.9-13.9-.3-21 3.4V19Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
      />
      <Path
        d="M32 19v27.9"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
      />
      <Path
        d="M47 8.5 49 12l3.5 2-3.5 2L47 19.5l-2-3.5-3.5-2L45 12l2-3.5Z"
        fill={color}
      />
    </Svg>
  );
}
