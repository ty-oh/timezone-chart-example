// Day.js 초기화
dayjs.extend(dayjs_plugin_utc);
dayjs.extend(dayjs_plugin_timezone);

const tz = 'America/New_York';

function generateTimeSeries(startUnix, endUnix, step = 30 * 60 * 1000) {
  const data = [];

  for (let ts = startUnix; ts <= endUnix; ts += step) {
    data.push({
      unixtime: ts,
      value: Math.random() * 100
    });
  }

  return data;
}

function renderChart(canvasId, data) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => new Date(d.unixtime)))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([height - margin.bottom, margin.top]);

  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#333';

  data.forEach(d => {
    const label = dayjs(d.unixtime).tz(tz).format('HH:mm');
    ctx.fillText(label, x(new Date(d.unixtime)), height - margin.bottom + 4);
  });

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  for (let i = 0; i <= 5; i++) {
    const val = i * 20;
    const yPos = y(val);
    ctx.fillText(val, margin.left - 6, yPos);
    ctx.beginPath();
    ctx.moveTo(margin.left, yPos);
    ctx.lineTo(width - margin.right, yPos);
    ctx.strokeStyle = '#eee';
    ctx.stroke();
  }

  ctx.beginPath();

  for (let i = 0; i < data.length; i++) {
    const pt = data[i];
    const currX = x(new Date(pt.unixtime));
    const currY = y(pt.value);

    if (i === 0) {
      ctx.moveTo(currX, currY);
    } else {
      const prevTime = data[i - 1].unixtime;
      const diffMin = (pt.unixtime - prevTime) / (1000 * 60);

      if (diffMin > 40) {
        ctx.moveTo(currX, currY);
      } else {
        ctx.lineTo(currX, currY);
      }
    }
  }

  ctx.strokeStyle = 'steelblue';
  ctx.lineWidth = 2;
  ctx.stroke();

  data.forEach(d => {
    const xPos = x(new Date(d.unixtime));
    const yPos = y(d.value);
    ctx.beginPath();
    ctx.arc(xPos, yPos, 3, 0, 2 * Math.PI);
    ctx.fillStyle = 'orange';
    ctx.fill();
  });
}

// DST 시작: 2025-03-09 (02:00 → 03:00 skip)
const dstStartData = generateTimeSeries(
  dayjs.tz('2025-03-09T00:00:00', tz).valueOf(),
  dayjs.tz('2025-03-09T12:00:00', tz).valueOf()
);
renderChart('dst-start', dstStartData);

// DST 종료: 2025-11-02 (01:00 → 01:00 반복)
const dstEndData = generateTimeSeries(
  dayjs.tz('2025-11-02T00:00:00', tz).valueOf(),
  dayjs.tz('2025-11-02T12:00:00', tz).valueOf()
);
renderChart('dst-end', dstEndData);
