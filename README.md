# 上外杯 #3

静态赛事站点，发布于 `https://oneyaya.github.io/shangwai-cup-3/`。

## 页面

- `#home`：海报与双赛道入口。
- `#fun/schedule`、`#competitive/schedule`：娱乐按日期、竞技按团队查看。
- `#fun/rules`、`#competitive/rules`：规则整理与原始 DOCX 下载。
- `#fun/scores`、`#competitive/scores`：正式成绩 / 本地试算切换。
- `#fun/calculator`、`#competitive/calculator`：逐项计分、团队去重、导入导出。

只需静态服务器，无构建依赖。Hash 路由兼容 GitHub Pages 的子目录部署。

## 发布成绩

1. 在计分台逐位录入选手。分数自动保存于当前浏览器的 localStorage。
2. 核对各项条件和裁判口径；输入游戏结算分后，该选手才计入得分表。
3. 导出计分 JSON，将其内容替换此目录下的 `results.json` 后提交。
4. 等待 GitHub Pages 发布。访客默认看到已发布成绩，本地操作不能修改公开成绩。

`results.json` 包含原始录入及裁判口径，网站重新计算总分，不能通过直接填入 total 伪造计算结果。无远程数据库或身份认证；公开发布权限由 GitHub 仓库控制。JSON 与备注发布后均可公开读取，不要包含私人信息。导入会合并选手，覆盖已有选手前弹窗确认。跨设备需导出后导入。

## 数据与计分口径

名单、时间、队伍来自用户提供的截图；赛程年份按本届 2026 年，时区按北京时间。需修改名单时编辑 `data.js`。头像由原始赛程图作为 CSS sprite 显示，没有新增身份图片。当前 D 类队伍为三名竞技选手，娱乐赛道独立；A/B/C 混合队伍只在原文历史配置中保留。

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

`app.js` 页面与交互；`scoring.js` 纯计分逻辑；`data.js` 名单与规则数据；`styles.css` 响应式样式；`assets/poster.png` 多语种海报；`rules/` 原始规则。海报中的英、西、日、法语为设计性译写，不标为游戏官方译名。海报使用内置 imagegen 基于提供参考生成。

## 验证

运行 `node tests.cjs` 检查计分边界、奖励互斥、队内去重、通关前提、导入校验。所有改动位于此子目录，不更改个人主页。
