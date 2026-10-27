
const fs = require("node:fs");

const username = "jerowzky";
const token = process.env.GH_CONTRIBUTIONS_TOKEN;

if (!token) {
  throw new Error("Missing GH_CONTRIBUTIONS_TOKEN secret.");
}

async function main() {
  const today = new Date();

  const to = new Date(Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  ));

  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 364);

  const toDate = to.toISOString().slice(0, 10);
  const fromDate = from.toISOString().slice(0, 10);

  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
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
      variables: {
        login: username,
        from: `${fromDate}T00:00:00Z`,
        to: `${toDate}T23:59:59Z`
      }
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
    from: contributions[0]?.date ?? fromDate,
    to: contributions[contributions.length - 1]?.date ?? toDate,
    contributions
  };

  fs.writeFileSync(
    "contributions.json",
    JSON.stringify(output, null, 2) + "\n"
  );

  console.log(
    `Updated ${contributions.length} days (${output.from} to ${output.to}); total: ${output.total}`
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
