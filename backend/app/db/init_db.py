"""
投研协作平台 - 数据库初始化与种子数据
"""
import asyncio
from app.core.database import engine, Base, async_session_factory
from app.core.security import get_password_hash
from app.models.models import (
    User, UserRole, Company, ResearchTemplate, TemplateType,
)


async def init_db():
    """初始化数据库表"""
    async with engine.begin() as conn:
        # 启用 pgvector 扩展
        await conn.execute(
            __import__("sqlalchemy").text("CREATE EXTENSION IF NOT EXISTS vector")
        )
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created successfully")


async def seed_data():
    """插入种子数据"""
    async with async_session_factory() as session:
        # 检查是否已有数据
        from sqlalchemy import select, func
        count = (await session.execute(select(func.count()).select_from(User))).scalar()
        if count > 0:
            print("⏭️  Seed data already exists, skipping")
            return

        # === 创建用户 ===
        users = [
            User(username="admin", email="admin@research.com", hashed_password=get_password_hash("admin123"),
                 name="系统管理员", role=UserRole.ADMIN, team="system"),
            User(username="researcher1", email="r1@research.com", hashed_password=get_password_hash("research123"),
                 name="张研究员", role=UserRole.RESEARCHER, team="TMT",
                 coverage_scope={"company_ids": [], "industries": ["半导体", "消费电子"]}),
            User(username="researcher2", email="r2@research.com", hashed_password=get_password_hash("research123"),
                 name="李研究员", role=UserRole.RESEARCHER, team="消费",
                 coverage_scope={"company_ids": [], "industries": ["食品饮料", "家电"]}),
            User(username="pm1", email="pm1@research.com", hashed_password=get_password_hash("pm123"),
                 name="王基金经理", role=UserRole.PM, team="权益一部",
                 coverage_scope={"portfolio_ids": [], "watchlist_ids": []}),
            User(username="leader1", email="leader1@research.com", hashed_password=get_password_hash("leader123"),
                 name="赵所长", role=UserRole.LEADER, team="研究所"),
        ]
        session.add_all(users)
        await session.flush()

        # === 创建示例公司 ===
        companies = [
            Company(name="示例科技", ticker="000001.SZ", industry="半导体", sector="TMT",
                    tags=["AI芯片", "国产替代"], peer_list=[],
                    description="国内领先的半导体设计企业"),
            Company(name="示例消费", ticker="600001.SH", industry="食品饮料", sector="消费",
                    tags=["白酒", "高端消费"], peer_list=[],
                    description="知名白酒企业"),
            Company(name="示例制造", ticker="300001.SZ", industry="高端制造", sector="制造",
                    tags=["新能源", "智能制造"], peer_list=[],
                    description="新能源设备制造商"),
        ]
        session.add_all(companies)
        await session.flush()

        # 更新用户覆盖范围
        users[1].coverage_scope = {"company_ids": [companies[0].id], "industries": ["半导体"]}
        users[2].coverage_scope = {"company_ids": [companies[1].id], "industries": ["食品饮料"]}
        users[3].coverage_scope = {
            "portfolio_ids": [companies[0].id, companies[1].id],
            "watchlist_ids": [companies[2].id],
        }

        # === 创建研究模板 ===
        templates = [
            ResearchTemplate(
                name="个股深度研究", type=TemplateType.DEEP_RESEARCH,
                description="适用于首次覆盖或深度更新的个股研究",
                sections={
                    "steps": [
                        {"id": "overview", "title": "公司概览", "required": True,
                         "hints": ["主营业务", "市场地位", "核心竞争力"]},
                        {"id": "industry", "title": "行业格局", "required": True,
                         "hints": ["市场规模", "竞争格局", "行业趋势"]},
                        {"id": "competitive", "title": "竞争优势分析", "required": True,
                         "hints": ["技术壁垒", "客户粘性", "成本优势"]},
                        {"id": "financial", "title": "财务分析", "required": True,
                         "hints": ["收入拆分", "盈利能力", "现金流", "资产负债"]},
                        {"id": "valuation", "title": "估值讨论", "required": True,
                         "hints": ["PE/PB", "DCF", "相对估值"]},
                        {"id": "risk", "title": "风险提示", "required": True,
                         "hints": ["经营风险", "行业风险", "政策风险"]},
                        {"id": "conclusion", "title": "投资结论", "required": True,
                         "hints": ["评级", "核心逻辑", "催化剂"]},
                    ]
                },
                is_system_default=True,
                created_by="system", updated_by="system",
            ),
            ResearchTemplate(
                name="财报点评", type=TemplateType.EARNINGS_REVIEW,
                description="适用于季报/半年报/年报的快速点评",
                sections={
                    "steps": [
                        {"id": "metrics", "title": "核心指标速览", "required": True,
                         "hints": ["收入", "利润", "毛利率", "净利率"]},
                        {"id": "surprise", "title": "超预期/低预期", "required": True,
                         "hints": ["哪些指标超预期", "哪些低预期", "原因分析"]},
                        {"id": "breakdown", "title": "细分业务拆解", "required": False,
                         "hints": ["各业务线表现", "新业务进展"]},
                        {"id": "outlook", "title": "展望与调整", "required": True,
                         "hints": ["管理层指引", "盈利预测调整"]},
                        {"id": "conclusion", "title": "结论更新", "required": True,
                         "hints": ["是否调整评级", "核心假设变化"]},
                    ]
                },
                is_system_default=True,
                created_by="system", updated_by="system",
            ),
            ResearchTemplate(
                name="事件点评", type=TemplateType.EVENT_REVIEW,
                description="适用于重大公告、政策事件等的快速点评",
                sections={
                    "steps": [
                        {"id": "event", "title": "事件概述", "required": True,
                         "hints": ["事件内容", "时间", "涉及方"]},
                        {"id": "impact", "title": "影响分析", "required": True,
                         "hints": ["对公司影响", "对行业影响", "短期/长期"]},
                        {"id": "historical", "title": "历史类比", "required": False,
                         "hints": ["历史上类似事件", "当时的影响"]},
                        {"id": "update", "title": "观点更新", "required": True,
                         "hints": ["是否更新评级", "假设调整"]},
                    ]
                },
                is_system_default=True,
                created_by="system", updated_by="system",
            ),
            ResearchTemplate(
                name="同行比较", type=TemplateType.PEER_COMPARISON,
                description="适用于行业内多家公司的横向比较研究",
                sections={
                    "steps": [
                        {"id": "overview", "title": "行业概览", "required": True,
                         "hints": ["行业现状", "景气度", "关键变量"]},
                        {"id": "matrix", "title": "公司对比矩阵", "required": True,
                         "hints": ["核心指标对比表", "财务指标", "估值指标"]},
                        {"id": "diff", "title": "关键差异分析", "required": True,
                         "hints": ["竞争优势差异", "增长差异", "风险差异"]},
                        {"id": "ranking", "title": "投资优先级排序", "required": True,
                         "hints": ["综合排名", "推荐理由"]},
                    ]
                },
                is_system_default=True,
                created_by="system", updated_by="system",
            ),
            ResearchTemplate(
                name="电话会纪要整理", type=TemplateType.TRANSCRIPT_SUMMARY,
                description="适用于电话会议/调研纪要的结构化整理",
                sections={
                    "steps": [
                        {"id": "overview", "title": "经营概况", "required": True,
                         "hints": ["整体经营情况", "行业环境"]},
                        {"id": "breakdown", "title": "业务拆分", "required": True,
                         "hints": ["各业务线进展", "新业务", "海外业务"]},
                        {"id": "guidance", "title": "管理层指引", "required": True,
                         "hints": ["收入指引", "利润率指引", "资本开支计划"]},
                        {"id": "qa", "title": "Q&A 要点", "required": True,
                         "hints": ["关键问答", "增量信息"]},
                        {"id": "tone", "title": "口径变化", "required": False,
                         "hints": ["与上次相比的口径变化", "语气变化"]},
                    ]
                },
                is_system_default=True,
                created_by="system", updated_by="system",
            ),
        ]
        session.add_all(templates)
        await session.commit()

        print("✅ Seed data inserted successfully")
        print("   Users: admin / researcher1 / researcher2 / pm1 / leader1")
        print("   Companies: 示例科技 / 示例消费 / 示例制造")
        print("   Templates: 5 system default templates")


async def main():
    await init_db()
    await seed_data()


if __name__ == "__main__":
    asyncio.run(main())
