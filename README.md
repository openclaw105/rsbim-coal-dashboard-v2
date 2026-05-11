# RSBIM 储罐结构安全智能监测系统 v2.0

基于代码审查建议重构的全新版本。

## 改进内容

### P1 问题修复
- ✅ 修复 CSS 语法错误（缺少大括号闭合）
- ✅ 修复动画定义不完整问题
- ✅ 添加导航栏点击事件

### P2 问题修复
- ✅ 统一导航栏样式（gap: 6px, padding: 10px 18px）
- ✅ 提取公共 CSS 到独立文件
- ✅ 移除重复的粒子容器
- ✅ 添加当前页面标识（active 类）

### P3 问题修复
- ✅ 移除内联样式，使用 CSS 类
- ✅ 添加错误处理（try-catch）
- ✅ 使用配置常量替代硬编码

## 文件结构

```
rsbim-coal-dashboard-v2/
├── index.html      # 首页
├── data.html       # 综合数据
├── trends.html     # 趋势监测
├── history.html    # 历史数据
├── sensors.html    # 传感器运维
├── settings.html   # 系统设置
├── style.css       # 共享样式
├── app.js          # 应用逻辑
└── echarts.min.js  # 图表库
```

## 部署

推送到 GitHub Pages:
```bash
git remote add origin https://github.com/openclaw105/rsbim-coal-dashboard-v2.git
git branch -M main
git add .
git commit -m "RSBIM 储罐监测平台 v2.0"
git push -u origin main
```

## 访问地址

- 原平台: https://openclaw105.github.io/rsbim-coal-dashboard/
- **新平台**: https://openclaw105.github.io/rsbim-coal-dashboard-v2/
