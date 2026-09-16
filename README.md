# 上外杯 #3

静态赛事站点，发布于 `https://oneyaya.github.io/shangwai-cup-3/`。

## 页面

- `index.html#schedule`：按日期合并娱乐与竞技赛程，显示个人成绩。
- `index.html#teams`：两支竞技队伍、成员成绩与团队总分。
- `index.html#rules`：娱乐 / 竞技规则切换，提供三份原始 DOCX 下载。
- `workbench.html#fun`、`workbench.html#competitive`：独立记分工作台。

纯静态站点，无构建依赖，兼容 GitHub Pages 子目录部署。

## 记分与发布

1. 在工作台录入选手并复核裁判口径，结果自动保存在当前浏览器。
2. 同一浏览器的赛事页即时显示“未发布预览”；跨标签页通过 storage 事件同步。
3. 点击工作台“发布成绩”：输入只针对本仓库、具有 Contents 读写权限的 GitHub fine-grained token。令牌只用于当前请求，不写入浏览器存储或仓库，提交后立即清空输入框。
4. 网站直接更新 `OneYaYa/shangwai-cup-3` 的 `main` 分支 `results.json`，触发 GitHub Pages 部署。公开页面每 30 秒检查成绩文件。令牌权限、线上内容和 SHA 均会校验，避免并发覆盖。
5. 也可以导出 JSON 手动更新 `results.json`；支持备份导入。

工作台与公开展示共用 `scoring.js`，竞技队内去重和首通奖励统一计算。匿名访客只能本地试算，没有仓库写入权限不能修改公开成绩。成绩文件包含原始录入、备注与裁判口径；发布前应核对其内容。

## 数据与计分口径

名单、时间、队伍来自用户提供的截图；赛程年份按本届 2026 年，时区按北京时间。需修改名单时编辑 `data.js`。十名选手均使用 `assets/avatars/` 下用户上传的独立原图，保留原始文件，不再从赛程截图截取。当前 D 类队伍为三名竞技选手，娱乐赛道独立；A/B/C 混合队伍只在原文历史配置中保留。

四项未明确条款在计分台可统一修改，并随 JSON 发布：

| 字段 | 默认值 | 含义 |
| --- | --- | --- |
| factions | best | 多阵营只取最高一项，each 为分别累加 |
| relics | combined | 复得之轮 / 果腹合计最多 200，each 为各 200 |
| dPenalty | after | D 类违规按主公式在倍率后扣除，before 为倍率前 |
| firstClear | team | D 类首通奖励直接加团队分，before / after 为个人倍率前 / 后 |

这不是官方补充规则，须主办方确认。其他实现约定：队内追猎与特殊关奖励按截图赛程顺序分配给首位勾选条件且填入结算分的选手；同名特殊关跨层共享一个资格；同域共存每人一次；裁判调整在倍率后计入且必须填写理由。症结之核击杀可以独立于整关通关勾选。只对明确要求通关的加分检查 completed。D 类违规仅由抗压位录入。未录入的选手不参与去重和团队统计。

竞技总分：`(base + settlementBonuses - 7.5 * parts + ruleBonuses) * multiplier - penalty + manualAdjustment`。全追猎、机械师禁用、抗压位倍率相加。畸症全追猎 150 自动替代追猎3 的 75。同域共存黑流地脉与全追猎的额外 150 叠加于对应两项之上。分数显示保留最多 2 位小数。

原始规则下载文件未经改动。`rules-source.js` 是原文文本抽取，保留历史版本更新；网站整理版优先使用文件正文的最新条目与用户明确的 D 类配置。

## 文件

`app.js` 页面与交互；`scoring.js` 纯计分逻辑；`data.js` 名单与规则数据；`styles.css` 响应式样式；`assets/poster.png` 中英双语海报；`rules/` 原始规则。海报以用户提供的赛事海报为风格参考，通过内置 imagegen 生成深青色树海背景、银白标题的无人物版本。`assets/schedule.png` 保留用户提供的原始赛程截图，供十名选手头像定位及原图查看。

## 验证

运行 `node tests.cjs` 检查计分边界、奖励互斥、队内去重、通关前提、导入校验。所有改动位于此子目录，不更改个人主页。

浏览器回归：安装 Playwright 后运行 `node ui-tests.cjs`。可使用 `CHROMIUM_PATH` 指定浏览器、`QA_DIR` 保存截图。测试覆盖跨标签页个人与团队成绩联动、移动端溢出、发布请求及冲突保护；GitHub 请求使用模拟响应，不会发布测试成绩。
