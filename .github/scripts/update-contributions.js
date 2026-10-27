
const fs = require("node:fs");

const username = "jerowzky";
const token = process.env.GH_CONTRIBUTIONS_TOKEN;

if (!token) {
  throw new Error("Missing GH_CONTRIBUTIONS_TOKEN secret.");
}

async function main() {
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            colors
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
                color
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query,
      variables: { login: username }
    })
  });

  const result = await response.json();

  if (!response.ok || result.errors || !result.data?.user) {
    throw new Error(
      JSON.stringify(result.errors || result, null, 2)
    );
  }

  const calendar =
    result.data.user.contributionsCollection.contributionCalendar;

  const levelMap = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4
  };

  const contributions = calendar.weeks.flatMap(week =>
    week.contributionDays.map(day => ({
      date: day.date,
      count: day.contributionCount,
      level: levelMap[day.contributionLevel] ?? 0,
      color: day.color
    }))
  );

  const output = {
    username,
    total: calendar.totalContributions,
    colors: calendar.colors,
    contributions
  };

  fs.writeFileSync(
    "contributions.json",
    JSON.stringify(output, null, 2) + "\n"
  );

  console.log(
    `Updated ${contributions.length} days; total: ${output.total}`
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
