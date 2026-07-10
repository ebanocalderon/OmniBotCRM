import asyncio
import asyncpg

async def run():
    conn = await asyncpg.connect("postgresql://omnibot:omnibot@postgres:5432/omnibot")
    await conn.execute("UPDATE alembic_version SET version_num='6f336fd88b2a'")
    print("Database version reset")
    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
