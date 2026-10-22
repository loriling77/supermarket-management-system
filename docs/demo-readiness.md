# 本地演示准备与验证记录

本文说明如何运行和演示。面试材料独立保存在 [项目理解与面试讲解](project-walkthrough.zh-CN.md)。

## 本地演示账号

仓库根目录执行：

```powershell
node scripts/prepare-local-demo.mjs
```

生成的顾客账号保存在 `.demo-credentials.local.json`，已被 Git 忽略。重复运行会复用并验证账号。密码仅在本地文件查看，不放进 README、截图或提交。
脚本只操作本地 API，不创建 Azure 账号或提升管理员权限。

### 管理员演示

使用现有管理员账号。若需要配置新的本地管理员：

1. 先在注册页创建专用账号。
2. 开发环境临时配置：

   ```powershell
   dotnet user-secrets set "AdminSetup:Enabled" "true" --project backend/Supermarket.Api
   dotnet user-secrets set "AdminSetup:Email" "YOUR_REGISTERED_DEMO_EMAIL" --project backend/Supermarket.Api
   ```

3. 重启本地 API，等待 `/health/ready` 返回 200。
4. 将 `AdminSetup:Enabled` 设为 `false` 并重启，再使用该账号登录。

初始化仅在 Development 生效，只提升指定的已有账号。它不是公开权限修改接口，也不用于 Azure 自动提权。

## 5 分钟演示

| 时间 | 操作 | 重点 |
| --- | --- | --- |
| 0:00–0:40 | 顾客登录 | 清晰可用的入口，不共享密码文件 |
| 0:40–1:30 | 关键词加 Enter、选择数量、重复加购 | 不区分大小写、数量合并、库存限制 |
| 1:30–2:15 | 模拟结账并打开 My orders | 数据库价格、扣库存、订单持久化，没有真实扣款 |
| 2:15–3:00 | 配置 AI 后生成清单、调整数量 | 总价更新、库存边界、失败反馈 |
| 3:00–4:15 | Logout，管理员登录并编辑商品 | 退出会话、Save 高亮/Add 变浅、保存后刷新 |
| 4:15–5:00 | 统计与客户订单，指出测试和源码 | 解释实现及验证边界 |

客户搜索只匹配用户名。商品/分类/厂商写操作要求 Admin；分类/厂商读取允许 Admin 或 User；AI 要求 User。
删除演示应使用专用临时记录，已被商品或订单关联的记录可能不能删除。

## 本地检查

```powershell
# 登录、Cookie、商品、本人订单和退出
node scripts/verify-local-demo.mjs

# 可选：新增一张模拟订单并使用一件库存
node scripts/verify-local-demo.mjs --checkout
```

本轮带 `--checkout` 检查创建了本地模拟订单 7，验证数据库价格、库存精确减少一件、本人订单历史和退出 Cookie。没有真实支付。
它依赖本地真实 API/SQL，不放进无数据库的 CI；一次成功不是并发验证。

## 验证记录（2026-10-22）

| 检查 | 结果与边界 |
| --- | --- |
| `npm test` | 修复目录后，12 项 Node 测试及 14 项 Vitest 测试全部通过 |
| `dotnet test` | 45 项通过，包括 30 项 HTTP 路由/授权测试；测试身份和 InMemory 不等同于真实登录/SQL |
| 本地 API/SQL | 健康检查、演示账号、一次模拟购买、扣库存、订单历史和退出通过 |
| 图表测试 | 原来跨面板查找相同空文案；已分区断言并覆盖图表空数据/失败 |
| Logout | 调用后端退出，失败保留页面并显示错误，过期会话可返回登录 |
| 订单弹窗 | 请求失败显示错误，不再误报没有订单 |
| 依赖 | Pkcs 更新至 10.0.13，完整后端测试不再出现此前两项漏洞警告 |
| 前端 build / 后端 publish | 均通过；使用独立输出目录避免干扰运行中的本地 API |
| 发布产物 smoke check | 1 项通过，验证数据库不可用时仍能访问网页、静态资源和正确的健康/API 状态 |
| 最终只读审查 | 未发现需要阻止提交的具体问题 |
| Azure | 当前页面与 readiness 检查超时，线上可用性待确认 |

静态检查无错误，保留 4 项已有 React effect 警告；构建仍提示 bundle 较大。这些不等于测试失败，也不能描述为已消除。

## 提交与上线

继续使用现有 Azure 站点，上线在本地收尾之后处理：

1. 查看 diff，只提交已确认的源码、测试、文档和配置。
2. 核对 `.demo-credentials.local.json`、`.env`、数据库密码和 AI Key 没被跟踪。
3. 完成前端 test/build/lint、后端测试和发布产物 smoke check。
4. Commit 保存本地版本，push 更新 GitHub；main 推送会触发现有部署流程，PR 只构建和测试。
5. 按 [Azure 部署说明](azure-deployment.md) 配置连接、网络、迁移和 AI，待 `/health/ready` 返回 200 再分享。
6. 线上顾客可注册，管理员账号由所有者配置后单独提供；本地账号不是线上账号。

提交、推送和部署分别以 Git 提交记录、远端分支和 Actions 结果为准。本地演示账号不会自动创建到 Azure；线上数据、配置和管理员账号仍需站点所有者准备。
