# Scripts

## fetch-yesterday.ts

TypeScript script for fetching and storing yesterday's temperature data. Designed to run as a daily cron job.

### Features

- Automatically calculates yesterday's date using the timezone configured in `.env`
- Fetches temperature data from VisualCrossing API
- Maps temperature to color based on configured ranges
- Inserts data into SQLite database
- Handles duplicate entries gracefully
- Provides detailed logging with ISO timestamps

### Setup

Test the script manually:
```bash
bun run scripts/fetch-yesterday.ts
```

Or use the bash wrapper (which loads .env automatically):
```bash
chmod +x scripts/fetch-yesterday.sh
./scripts/fetch-yesterday.sh
```

### Cron Job Setup

To run daily at 2am, add this line to your crontab:

```bash
# Edit crontab
crontab -e

# Add this line (adjust path to your project location)
# Option 1: Use the bash wrapper (recommended - handles .env loading)
0 2 * * * /path/to/temperature-blanket-bun/scripts/fetch-yesterday.sh >> /path/to/temperature-blanket-bun/logs/cron.log 2>&1

# Option 2: Call TypeScript directly with Bun
0 2 * * * cd /path/to/temperature-blanket-bun && bun run scripts/fetch-yesterday.ts >> logs/cron.log 2>&1
```

For logging output, create a logs directory:
```bash
mkdir -p logs
```

### Alternative: systemd timer (Linux)

Create a systemd service and timer for more reliable scheduling:

**Service file** (`/etc/systemd/system/temperature-blanket.service`):
```ini
[Unit]
Description=Fetch yesterday's temperature data
After=network.target

[Service]
Type=oneshot
User=your-username
WorkingDirectory=/path/to/temperature-blanket-bun
ExecStart=/usr/bin/env bun run scripts/fetch-yesterday.ts
StandardOutput=append:/path/to/temperature-blanket-bun/logs/cron.log
StandardError=append:/path/to/temperature-blanket-bun/logs/cron.log

[Install]
WantedBy=multi-user.target
```

**Timer file** (`/etc/systemd/system/temperature-blanket.timer`):
```ini
[Unit]
Description=Run temperature blanket data fetch daily at 2am

[Timer]
OnCalendar=daily
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start the timer:
```bash
sudo systemctl daemon-reload
sudo systemctl enable temperature-blanket.timer
sudo systemctl start temperature-blanket.timer

# Check timer status
sudo systemctl list-timers temperature-blanket.timer
```

### Troubleshooting

- **Script fails to find .env**: Ensure `.env` file exists in project root
- **Date calculation issues**: The script supports both GNU date and BSD date (macOS)
- **Permission errors**: Ensure script has execute permissions and can access the database
- **API errors**: Check that `VISUALCROSSING_API_KEY` is valid and has API credits remaining
