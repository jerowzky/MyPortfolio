
const fs = require("node:fs");

const username = "jerowzky";
const token = process.env.GH_CONTRIBUTIONS_TOKEN;

if (!token) {
  throw new Error("Missing GH_CONTRIBUTIONS_TOKEN secret.");
}

async function main() {
  // Calculate the rolling 365-day period in UTC.
  const today = new Date();

  const to = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    )
  );

  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 364);

  const fromDate = from.toISOString().slice(0, 10);
  const toDate = to.toISOString().slice(0, 10);

  const query = `
    query (
      $login: String!
      $from: DateTime!
      $to: DateTime!
    ) {
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
      `GitHub GraphQL request failed:\n${JSON.stringify(
        result.errors || result,
        null,
        2
      )}`
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

  // Keep only dates within the requested 365-day period.
  const contributions = calendar.weeks
    .flatMap((week) => week.contributionDays)
    .filter((day) => day.date >= fromDate && day.date <= toDate)
    .map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: levelMap[day.contributionLevel] ?? 0,
      color: day.color
    }));

  if (contributions.length === 0) {
    throw new Error("GitHub returned an empty contribution calendar.");
  }

  // Calculate the total for the dates included in the JSON.
  const total = contributions.reduce(
    (sum, day) => sum + day.count,
    0
  );

  const output = {
    username,
    total,
    colors: calendar.colors,
    from: fromDate,
    to: toDate,
    contributions
  };

  fs.writeFileSync(
    "contributions.json",
    JSON.stringify(output, null, 2) + "\n",
    "utf8"
  );

  console.log("GitHub contribution calendar updated.");
  console.log(`Username: ${username}`);
  console.log(`Requested period: ${fromDate} to ${toDate}`);
  console.log(
    `Calendar dates: ${contributions[0].date} to ${
      contributions[contributions.length - 1].date
    }`
  );
  console.log(`Calendar days: ${contributions.length}`);
  console.log(`Total contributions: ${total}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
