/**
 * RSBIM 储罐监测平台 v2.0 - 科幻版应用逻辑
 */

// 配置常量
const CONFIG = {
  dangerThreshold: 85,
  warningThreshold: 70,
  updateInterval: 60000,
  historyDays: 365
};

// 储罐数据
const TANKS = [
  { id: 'TANK-001', name: '1号储罐', type: '原油储罐', capacity: 10000 },
  { id: 'TANK-002', name: '2号储罐', type: '成品油罐', capacity: 5000 },
  { id: 'TANK-003', name: '3号储罐', type: '化学品罐', capacity: 2000 },
  { id: 'TANK-004', name: '4号储罐', type: 'LNG储罐', capacity: 3000 },
  { id: 'TANK-005', name: '5号储罐', type: '水罐', capacity: 8000 }
];

// 传感器类型
const SENSOR_TYPES = {
  strain: { name: '应变传感器', unit: 'με', icon: '📐' },
  tilt: { name: '倾斜传感器', unit: '°', icon: '📏' },
  settlement: { name: '沉降传感器', unit: 'mm', icon: '📍' },
  temperature: { name: '温度传感器', unit: '°C', icon: '🌡️' }
};

// 颜色方案
const COLORS = {
  primary: '#00d4ff',
  accent: '#00ff88',
  warning: '#ffaa00',
  danger: '#ff4444',
  purple: '#a855f7',
  yellow: '#ffd700'
};

// 生成粒子背景
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  
  for (let i = 0; i < 100; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (15 + Math.random() * 10) + 's';
    container.appendChild(particle);
  }
}

// 更新时间显示
function updateTime() {
  const timeEl = document.getElementById('currentTime');
  const updateEl = document.getElementById('lastUpdate');
  if (timeEl) {
    timeEl.textContent = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  }
  if (updateEl) {
    updateEl.textContent = new Date().toLocaleTimeString('zh-CN');
  }
}

// 获取传感器状态
function getSensorStatus(value) {
  try {
    if (value > CONFIG.dangerThreshold) return 'danger';
    if (value > CONFIG.warningThreshold) return 'warning';
    return 'normal';
  } catch (e) {
    return 'normal';
  }
}

// 生成传感器数据
function generateSensorData() {
  const sensors = [];
  TANKS.forEach(tank => {
    Object.keys(SENSOR_TYPES).forEach(type => {
      const baseValue = {
        strain: Math.random() * 20 + 5,
        tilt: Math.random() * 0.05 + 0.01,
        settlement: Math.random() * 20 + 5,
        temperature: 20 + Math.random() * 10
      }[type];
      
      sensors.push({
        id: `SN-${tank.id}-${type}`,
        tankId: tank.id,
        tankName: tank.name,
        type: type,
        typeName: SENSOR_TYPES[type].name,
        unit: SENSOR_TYPES[type].unit,
        value: baseValue.toFixed(2),
        status: getSensorStatus(type === 'temperature' ? baseValue : baseValue * 5),
        timestamp: new Date().toISOString()
      });
    });
  });
  return sensors;
}

// 渲染传感器网格
function renderSensorGrid() {
  const grid = document.getElementById('sensorGrid');
  if (!grid) return;
  
  const sensors = generateSensorData();
  grid.innerHTML = sensors.map(s => `
    <div class="sensor-card ${s.status}" onclick="showSensorDetail('${s.id}')">
      <div class="id">${s.id}</div>
      <div class="value">${s.value}</div>
      <div class="type">${s.typeName}</div>
    </div>
  `).join('');
}

// 渲染应变图表
function renderStrainChart() {
  const chartDiv = document.getElementById('strainChart');
  if (!chartDiv) return;
  
  const chart = echarts.init(chartDiv);
  const colors = [COLORS.primary, COLORS.accent, COLORS.warning, COLORS.danger, COLORS.purple];
  
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.85)',
      borderColor: COLORS.primary,
      textStyle: { color: '#fff' }
    },
    legend: {
      data: TANKS.map(t => t.name),
      top: 30,
      textStyle: { color: '#fff' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '80px', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { color: '#aaa' }
    },
    yAxis: {
      type: 'value',
      name: 'με',
      max: 100,
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { color: '#aaa' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
    },
    series: TANKS.map((tank, i) => ({
      name: tank.name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: Array.from({length: 7}, () => Math.random() * 30 + 10),
      lineStyle: { width: 2 },
      itemStyle: { color: colors[i] },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colors[i] + '66' },
          { offset: 1, color: colors[i] + '00' }
        ])
      }
    }))
  });
  
  window.strainChart = chart;
}

// 渲染数据对比图表
function renderDataChart() {
  const chartDiv = document.getElementById('dataChart');
  if (!chartDiv) return;
  
  const chart = echarts.init(chartDiv);
  
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0,0,0,0.85)',
      borderColor: COLORS.primary,
      textStyle: { color: '#fff' }
    },
    legend: {
      data: ['应变', '倾斜', '沉降'],
      top: 30,
      textStyle: { color: '#fff' }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '80px', containLabel: true },
    xAxis: {
      type: 'category',
      data: TANKS.map(t => t.name),
      axisLine: { lineStyle: { color: '#666' } },
      axisLabel: { color: '#aaa' }
    },
    yAxis: [
      { type: 'value', name: 'με', position: 'left', axisLine: { lineStyle: { color: '#666' } }, axisLabel: { color: '#aaa' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
      { type: 'value', name: 'mm', position: 'right', axisLine: { lineStyle: { color: '#666' } }, axisLabel: { color: '#aaa' }, splitLine: { show: false } }
    ],
    series: [
      { name: '应变', type: 'bar', data: TANKS.map(() => Math.random() * 20 + 10), itemStyle: { color: COLORS.primary } },
      { name: '倾斜', type: 'line', yAxisIndex: 0, data: TANKS.map(() => Math.random() * 0.05 + 0.01), itemStyle: { color: COLORS.accent } },
      { name: '沉降', type: 'line', yAxisIndex: 1, data: TANKS.map(() => Math.random() * 20 + 5), itemStyle: { color: COLORS.warning } }
    ]
  });
  
  window.dataChart = chart;
}

// 渲染传感器状态分布
function renderSensorChart() {
  const chartDiv = document.getElementById('sensorChart');
  if (!chartDiv) return;
  
  const chart = echarts.init(chartDiv);
  
  const normalCount = Math.floor(Math.random() * 10 + 100);
  const warningCount = Math.floor(Math.random() * 5);
  const dangerCount = 0;
  
  chart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0,0,0,0.85)',
      borderColor: COLORS.primary,
      textStyle: { color: '#fff' }
    },
    legend: {
      top: 'bottom',
      textStyle: { color: '#fff' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 5,
        borderColor: '#0a0e27',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#fff' }
      },
      data: [
        { value: normalCount, name: '正常', itemStyle: { color: COLORS.accent } },
        { value: warningCount, name: '警告', itemStyle: { color: COLORS.warning } },
        { value: dangerCount, name: '危险', itemStyle: { color: COLORS.danger } }
      ]
    }]
  });
  
  window.sensorChart = chart;
}

// 显示模态框
function showModal(type) {
  const modal = document.getElementById('modal');
  const title = document.getElementById('modalTitle');
  const info = document.getElementById('modalInfo');
  
  if (type === 'tank-detail') {
    title.textContent = '储罐详情';
    info.innerHTML = TANKS.map(t => `
      <div style="margin-bottom:10px;padding:10px;background:rgba(0,212,255,0.1);border-radius:5px;">
        <strong style="color:${COLORS.primary}">${t.name}</strong> - ${t.type}<br>
        容量: ${t.capacity.toLocaleString()} m³
      </div>
    `).join('');
  }
  
  modal.classList.add('active');
}

// 关闭模态框
function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

// 显示传感器详情
function showSensorDetail(sensorId) {
  showModal('sensor-detail');
  document.getElementById('modalTitle').textContent = '传感器详情';
  document.getElementById('modalInfo').innerHTML = `
    <div style="margin-bottom:10px;">
      <strong style="color:${COLORS.primary}">${sensorId}</strong>
    </div>
    <div>状态: <span style="color:${COLORS.accent}">正常</span></div>
    <div>最后更新: ${new Date().toLocaleString()}</div>
  `;
  
  // 渲染模态框图表
  const modalChart = document.getElementById('modalChart');
  if (modalChart) {
    const chart = echarts.init(modalChart);
    chart.setOption({
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.85)', textStyle: { color: '#fff' } },
      xAxis: { type: 'category', data: ['1h', '2h', '3h', '4h', '5h', '6h'], axisLine: { lineStyle: { color: '#666' } }, axisLabel: { color: '#aaa' } },
      yAxis: { type: 'value', axisLine: { lineStyle: { color: '#666' } }, axisLabel: { color: '#aaa' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
      series: [{ type: 'line', smooth: true, data: Array.from({length: 6}, () => Math.random() * 10 + 10), itemStyle: { color: COLORS.primary } }]
    });
    window.modalChartInstance = chart;
  }
}

// 初始化
function init() {
  createParticles();
  updateTime();
  setInterval(updateTime, 1000);
  
  // 渲染图表
  renderStrainChart();
  renderDataChart();
  renderSensorChart();
  renderSensorGrid();
  
  // 窗口大小变化时重绘
  window.addEventListener('resize', () => {
    if (window.strainChart) window.strainChart.resize();
    if (window.dataChart) window.dataChart.resize();
    if (window.sensorChart) window.sensorChart.resize();
    if (window.modalChartInstance) window.modalChartInstance.resize();
  });
  
  console.log('RSBIM 平台 v2.0 科幻版初始化完成');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(init, 100);
});
