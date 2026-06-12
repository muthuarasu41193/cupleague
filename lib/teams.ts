/** National team display metadata for match cards & fixtures */
export const TEAM_META: Record<
  string,
  { flag: string; abbr: string; color: string }
> = {
  Argentina: { flag: "🇦🇷", abbr: "ARG", color: "#75AADB" },
  Brazil: { flag: "🇧🇷", abbr: "BRA", color: "#009C3B" },
  France: { flag: "🇫🇷", abbr: "FRA", color: "#002395" },
  Spain: { flag: "🇪🇸", abbr: "ESP", color: "#C60B1E" },
  England: { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", abbr: "ENG", color: "#FFFFFF" },
  Germany: { flag: "🇩🇪", abbr: "GER", color: "#FFCE00" },
  Portugal: { flag: "🇵🇹", abbr: "POR", color: "#006600" },
  Netherlands: { flag: "🇳🇱", abbr: "NED", color: "#FF6600" },
  Italy: { flag: "🇮🇹", abbr: "ITA", color: "#008C45" },
  Belgium: { flag: "🇧🇪", abbr: "BEL", color: "#EF3340" },
  Croatia: { flag: "🇭🇷", abbr: "CRO", color: "#FF0000" },
  Morocco: { flag: "🇲🇦", abbr: "MAR", color: "#C1272D" },
  USA: { flag: "🇺🇸", abbr: "USA", color: "#3C3B6E" },
  Mexico: { flag: "🇲🇽", abbr: "MEX", color: "#006847" },
  Japan: { flag: "🇯🇵", abbr: "JPN", color: "#BC002D" },
  "South Korea": { flag: "🇰🇷", abbr: "KOR", color: "#003478" },
  Uruguay: { flag: "🇺🇾", abbr: "URU", color: "#0038A8" },
  Colombia: { flag: "🇨🇴", abbr: "COL", color: "#FCD116" },
  Senegal: { flag: "🇸🇳", abbr: "SEN", color: "#00853F" },
  Nigeria: { flag: "🇳🇬", abbr: "NGA", color: "#008751" },
};

export function getTeamMeta(name: string) {
  return (
    TEAM_META[name] ?? {
      flag: "🏳️",
      abbr: name.slice(0, 3).toUpperCase(),
      color: "#64748b",
    }
  );
}
