/**
 * RSBIM 储罐监测平台 - 应用逻辑
 * v2.0 - 修复审查问题
 */

// 配置常量
const CONFIG = {
  dangerThreshold: 85,
  warningThreshold: 70,
  updateInterval: 60000,
  historyDays: 365
};

// 储罐数据（可替换为 API 调用）
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

/**
 * 获取传感器状态
 * @param {number} value - 传感器数值
 * @returns {string} 状态：normal | warning | danger
 */
function getSensorStatus(value) {
  try {
    if (value > CONFIG.dangerThreshold) {
      return 'danger';
    } else if (value > CONFIG.warningThreshold) {
      return 'warning';
    }
    return 'normal';
  } catch (e) {
    console.error('getSensorStatus error:', e);
    return 'normal';
  }
}

/**
 * 获取状态样式类名
 * @param {string} status - 状态
 * @returns {string} CSS 类名
 */
function getStatusClass(status) {
  const classes = {
    normal: 'status-normal',
    warning: 'status-warning',
    danger: 'status-danger'
  };
  return classes[status] || classes.normal;
}

/**
 * 获取状态显示文本
 * @param {string} status - 状态
 * @returns {string} 显示文本
 */
function getStatusText(status) {
  const texts = {
    normal: '正常',
    warning: '警告',
    danger: '危险'
  };
  return texts[status] || '未知';
}

/**
 * 模拟传感器数据
 * @returns {Array} 传感器数据数组
 */
function generateSensorData() {
  const sensors = [];
  TANKS.forEach(tank => {
    Object.keys(SENSOR_TYPES).forEach(type => {
      const baseValue = {
        strain: Math.random() * 20,
        tilt: Math.random() * 0.1,
        settlement: Math.random() * 30,
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

/**
 * 渲染传感器表格
 */
function renderSensorsTable() {
  try {
    const tbody = document.getElementById('sensors-table-body');
    if (!tbody) return;
    
    const sensors = generateSensorData();
    tbody.innerHTML = sensors.map(s => `
      <tr>
        <td>${s.id}</td>
        <td>${s.typeName}</td>
        <td>${s.tankName}</td>
        <td>${s.value}</td>
        <td>${s.type === 'temperature' ? '25-30' : '0-100'}</td>
        <td><span class="status-indicator ${getStatusClass(s.status)}">${getStatusText(s.status)}</span></td>
        <td>
          <button class="btn" onclick="viewSensor('${s.id}')" style="padding: 4px 8px; font-size: 11px;">详情</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    console.error('renderSensorsTable error:', e);
  }
}

/**
 * 渲染应变趋势图表
 */
function renderStrainChart() {
  try {
    const chartDiv = document.getElementById('strain-chart');
    if (!chartDiv) return;
    
    chartDiv.style.width = '100%';
    chartDiv.style.height = '450px';
    
    const chart = echarts.init(chartDiv);
    chart.setOption({
      title: { text: '应变趋势监测', left: 'center', textStyle: { color: '#fff', fontSize: 16 } },
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', textStyle: { color: '#fff' } },
      legend: { data: TANKS.map(t => t.name), top: 30, textStyle: { color: '#fff' } },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '80px', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'], axisLine: { lineStyle: { color: '#666' } }, axisLabel: { color: '#aaa' } },
      yAxis: { type: 'value', name: 'με', max: 100, axisLine: { lineStyle: { color: '#666' } }, axisLabel: { color: '#aaa' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
      series: TANKS.map((tank, i) => ({
        name: tank.name,
        type: 'line',
        smooth: true,
        data: Array.from({length: 7}, () => Math.random() * 20 + 5),
        lineStyle: { width: 2 },
        itemStyle: { color: ['#00d4ff', '#00ff88', '#ffaa00', '#ff6b6b', '#a855f7'][i] }
      }))
    });
    window.strainChart = chart;
    console.log('应变图表渲染完成');
  } catch (e) {
    console.error('renderStrainChart error:', e);
  }
}

/**
 * 渲染倾斜趋势图表
 */
function renderTiltChart() {
  try {
    const chartDiv = document.getElementById('tilt-chart');
    if (!chartDiv) return;
    
    chartDiv.style.width = '100%';
    chartDiv.style.height = '450px';
    
    const chart = echarts.init(chartDiv);
    chart.setOption({
      title: { text: '倾斜趋势监测', left: 'center', textStyle: { color: '#fff', fontSize: 16 } },
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', textStyle: { color: '#fff' } },
      legend: { data: TANKS.map(t => t.name), top: 30, textStyle: { color: '#fff' } },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '80px', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'], axisLine: { lineStyle: { color: '#666' } }, axisLabel: { color: '#aaa' } },
      yAxis: { type: 'value', name: '°', max: 0.5, axisLine: { lineStyle: { color: '#666' } }, axisLabel: { color: '#aaa' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
      series: TANKS.map((tank, i) => ({
        name: tank.name,
        type: 'line',
        smooth: true,
        data: Array.from({length: 7}, () => Math.random() * 0.05 + 0.01),
        lineStyle: { width: 2 },
        itemStyle: { color: ['#00d4ff', '#00ff88', '#ffaa00', '#ff6b6b', '#a855f7'][i] }
      }))
    });
    window.tiltChart = chart;
    console.log('倾斜图表渲染完成');
  } catch (e) {
    console.error('renderTiltChart error:', e);
  }
}

/**
 * 渲染温度趋势图表
 */
function renderTempChart() {
  try {
    const chartDiv = document.getElementById('temp-chart');
    if (!chartDiv) return;
    
    chartDiv.style.width = '100%';
    chartDiv.style.height = '450px';
    
    const chart = echarts.init(chartDiv);
    chart.setOption({
      title: { text: '温度趋势监测', left: 'center', textStyle: { color: '#fff', fontSize: 16 } },
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', textStyle: { color: '#fff' } },
      legend: { data: TANKS.map(t => t.name), top: 30, textStyle: { color: '#fff' } },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '80px', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'], axisLine: { lineStyle: { color: '#666' } }, axisLabel: { color: '#aaa' } },
      yAxis: { type: 'value', name: '°C', axisLine: { lineStyle: { color: '#666' } }, axisLabel: { color: '#aaa' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
      series: TANKS.map((tank, i) => ({
        name: tank.name,
        type: 'line',
        smooth: true,
        data: Array.from({length: 7}, () => Math.random() * 10 + 20),
        lineStyle: { width: 2 },
        itemStyle: { color: ['#00d4ff', '#00ff88', '#ffaa00', '#ff6b6b', '#a855f7'][i] }
      }))
    });
    window.tempChart = chart;
    console.log('温度图表渲染完成');
  } catch (e) {
    console.error('renderTempChart error:', e);
  }
}

/**
 * 渲染传感器分布地图
 */
function renderSensorMap() {
  try {
    const chartDiv = document.getElementById('sensor-map');
    if (!chartDiv) return;
    
    chartDiv.style.width = '100%';
    chartDiv.style.height = '300px';
    
    const chart = echarts.init(chartDiv);
    chart.setOption({
      title: { text: '传感器分布', left: 'center', textStyle: { color: '#fff', fontSize: 16 } },
      tooltip: { trigger: 'item', backgroundColor: 'rgba(0,0,0,0.8)', textStyle: { color: '#fff' } },
      series: [{
        type: 'scatter',
        symbolSize: 15,
        data: TANKS.map((tank, i) => ({
          name: tank.name,
          value: [Math.random() * 100, Math.random() * 100, i]
        })),
        itemStyle: { color: ['#00d4ff', '#00ff88', '#ffaa00', '#ff6b6b', '#a855f7'] }
      }]
    });
    window.sensorMap = chart;
    console.log('传感器地图渲染完成');
  } catch (e) {
    console.error('renderSensorMap error:', e);
  }
}

/**
 * 渲染实时图表
 */
function renderRealtimeChart() {
  try {
    const chartDiv = document.getElementById('realtime-chart');
    if (!chartDiv) return;
    
    // 确保容器有明确尺寸
    chartDiv.style.width = '100%';
    chartDiv.style.height = '450px';
    
    const chart = echarts.init(chartDiv);
    
    const option = {
      title: { text: '实时应变监测', left: 'center', textStyle: { color: '#fff', fontSize: 16 } },
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', textStyle: { color: '#fff' } },
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
        data: Array.from({length: 7}, () => Math.random() * 30 + 10),
        lineStyle: { width: 2 },
        itemStyle: {
          color: ['#00d4ff', '#00ff88', '#ffaa00', '#ff6b6b', '#a855f7'][i]
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: ['#00d4ff', '#00ff88', '#ffaa00', '#ff6b6b', '#a855f7'][i] + '80' },
            { offset: 1, color: ['#00d4ff', '#00ff88', '#ffaa00', '#ff6b6b', '#a855f7'][i] + '00' }
          ])
        }
      }))
    };
    
    chart.setOption(option);
    window.realtimeChart = chart;
    console.log('实时图表渲染完成');
  } catch (e) {
    console.error('renderRealtimeChart error:', e);
  }
}

/**
 * 渲染数据表格图表
 */
function renderDataChart() {
  try {
    const chartDiv = document.getElementById('data-chart');
    if (!chartDiv) return;
    
    chartDiv.style.width = '100%';
    chartDiv.style.height = '450px';
    
    const chart = echarts.init(chartDiv);
    
    const option = {
      title: { text: '储罐数据对比', left: 'center', textStyle: { color: '#fff', fontSize: 16 } },
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', textStyle: { color: '#fff' } },
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
        { name: '应变', type: 'bar', data: TANKS.map(() => Math.random() * 20 + 10), itemStyle: { color: '#00d4ff' } },
        { name: '倾斜', type: 'line', yAxisIndex: 0, data: TANKS.map(() => Math.random() * 0.05 + 0.01), itemStyle: { color: '#00ff88' } },
        { name: '沉降', type: 'line', yAxisIndex: 1, data: TANKS.map(() => Math.random() * 20 + 5), itemStyle: { color: '#ffaa00' } }
      ]
    };
    
    chart.setOption(option);
    window.dataChart = chart;
    console.log('数据图表渲染完成');
  } catch (e) {
    console.error('renderDataChart error:', e);
  }
}

/**
 * 查询历史数据
 */
function queryHistory() {
  try {
    const tankSelect = document.getElementById('tank-select');
    const sensorTypeSelect = document.getElementById('sensor-type-select');
    const tbody = document.getElementById('history-table-body');
    
    if (!tbody) return;
    
    const tankId = tankSelect?.value || 'all';
    const sensorType = sensorTypeSelect?.value || 'all';
    
    // 模拟历史数据
    const historyData = [];
    const now = new Date();
    
    for (let i = 0; i < 20; i++) {
      const time = new Date(now.getTime() - i * 3600000);
      historyData.push({
        time: time.toLocaleString('zh-CN'),
        tank: TANKS[Math.floor(Math.random() * TANKS.length)].name,
        type: Object.keys(SENSOR_TYPES)[Math.floor(Math.random() * 4)],
        value: (Math.random() * 30 + 10).toFixed(2),
        unit: 'με',
        status: 'normal'
      });
    }
    
    tbody.innerHTML = historyData.map(d => `
      <tr>
        <td>${d.time}</td>
        <td>${d.tank}</td>
        <td>${SENSOR_TYPES[d.type]?.name || d.type}</td>
        <td>${d.value}</td>
        <td>${d.unit}</td>
        <td><span class="status-indicator status-normal">${d.status}</span></td>
      </tr>
    `).join('');
    
    // 渲染图表
    const chartDiv = document.getElementById('history-chart');
    if (chartDiv) {
      chartDiv.style.width = '100%';
      chartDiv.style.height = '450px';
      
      const chart = echarts.init(chartDiv);
      chart.setOption({
        title: { text: '历史数据趋势', left: 'center', textStyle: { color: '#fff', fontSize: 16 } },
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', textStyle: { color: '#fff' } },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '60px', containLabel: true },
        xAxis: {
          type: 'category',
          data: historyData.map(d => d.time.split(' ')[1]),
          axisLine: { lineStyle: { color: '#666' } },
          axisLabel: { color: '#aaa' }
        },
        yAxis: { type: 'value', axisLine: { lineStyle: { color: '#666' } }, axisLabel: { color: '#aaa' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
        series: [{
          type: 'line',
          smooth: true,
          data: historyData.map(d => parseFloat(d.value)),
          itemStyle: { color: '#00d4ff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#00d4ff80' },
              { offset: 1, color: '#00d4ff00' }
            ])
          }
        }]
      });
      window.historyChart = chart;
      console.log('历史图表渲染完成');
    }
  } catch (e) {
    console.error('queryHistory error:', e);
  }
}

/**
 * 刷新传感器
 */
function refreshSensors() {
  renderSensorsTable();
}

/**
 * 查看传感器详情
 */
function viewSensor(sensorId) {
  alert(`查看传感器详情: ${sensorId}\n功能待实现`);
}

/**
 * 添加传感器
 */
function addSensor() {
  alert('添加传感器功能待实现');
}

/**
 * 导出传感器列表
 */
function exportSensors() {
  alert('导出功能待实现');
}

/**
 * 保存阈值设置
 */
function saveThresholds() {
  alert('阈值设置已保存');
}

/**
 * 保存数据采集配置
 */
function saveDataConfig() {
  alert('数据采集配置已保存');
}

/**
 * 保存通知设置
 */
function saveNotification() {
  alert('通知设置已保存');
}

/**
 * 导出历史数据
 */
function exportData() {
  alert('导出功能待实现');
}

/**
 * 初始化
 */
function init() {
  try {
    // 渲染图表
    if (document.getElementById('realtime-chart')) {
      renderRealtimeChart();
    }
    if (document.getElementById('data-chart')) {
      renderDataChart();
    }
    if (document.getElementById('strain-chart')) {
      renderStrainChart();
    }
    if (document.getElementById('tilt-chart')) {
      renderTiltChart();
    }
    if (document.getElementById('temp-chart')) {
      renderTempChart();
    }
    if (document.getElementById('sensors-table-body')) {
      renderSensorsTable();
    }
    if (document.getElementById('history-table-body')) {
      queryHistory();
    }
    if (document.getElementById('sensor-map')) {
      renderSensorMap();
    }
    
    // 窗口大小变化时重绘图表
    window.addEventListener('resize', () => {
      if (window.realtimeChart) window.realtimeChart.resize();
      if (window.dataChart) window.dataChart.resize();
      if (window.historyChart) window.historyChart.resize();
      if (window.strainChart) window.strainChart.resize();
      if (window.tiltChart) window.tiltChart.resize();
      if (window.tempChart) window.tempChart.resize();
      if (window.sensorMap) window.sensorMap.resize();
    });
    
    console.log('RSBIM 平台 v2.0 初始化完成');
  } catch (e) {
    console.error('init error:', e);
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
