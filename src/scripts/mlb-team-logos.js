import baseballIcon from "@/assets/baseball.png";

const logos = import.meta.glob("../assets/team-logos/*.svg", {
  eager: true,
  import: "default",
});

export default function getTeamLogoURL(teamId) {
  const match = Object.keys(logos).find((key) => key.endsWith(`/${teamId}.svg`));
  return (match && logos[match]) || baseballIcon;
}
