const username = process.argv[2];

if (!username) {
  console.log("Please enter GitHub username");
  console.log("Usage: github-activity <username>");
  process.exit(1);
}

const url = `https://api.github.com/users/${username}/events`;

async function fetchActivity() {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "github-activity-cli",
        "Accept": "application/vnd.github+json"
      }
    });

    if (!response.ok) {
      throw new Error(`User not found or API error (${response.status})`);
    }

    const events = await response.json();

    if (!events || events.length === 0) {
      console.log("No recent activity found");
      return;
    }

    events.slice(0, 10).forEach(event => {
      console.log(formatEvent(event));
    });

  } catch (error) {
    console.error("Error:", error.message);
  }
}

function formatEvent(event) {
  const repo = event.repo?.name || "unknown repo";

  switch (event.type) {
    case "PushEvent":
      return `- Pushed ${event.payload.commits?.length || 0} commits to ${repo}`;
    case "IssuesEvent":
      return `- ${event.payload.action} an issue in ${repo}`;
    case "WatchEvent":
      return `- Starred ${repo}`;
    case "ForkEvent":
      return `- Forked ${repo}`;
    case "CreateEvent":
      return `- Created ${event.payload.ref_type} in ${repo}`;
    default:
      return `- ${event.type.replace("Event", "")} in ${repo}`;
  }
}

fetchActivity();
