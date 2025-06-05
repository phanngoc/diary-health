import asyncio
from dotenv import load_dotenv
load_dotenv()
from browser_use import Agent
from langchain_openai import ChatOpenAI
from browser_use.browser import BrowserSession


website_check = [
    "https://vneconomy.vn/",
    "https://fica.dantri.com.vn/",
    "https://cafef.vn/",
    "https://vietnamfinance.vn/",
    "https://stockbiz.vn/"
]

stock_check = [
    "TPB", "VND", "SSI", "VCI", "HCM", "MBS", "VIX", "FPT", "MWG", "VNM", "GVR", "HPG", "BVH", "CTG", "BID", "VPB"
]                                                                                                    
task = """
You are a financial analyst. Your task is to read all websites ({website_check}) and extract relevant information about investment opportunities in Vietnam, what stock to buy, what sectors to invest in, what are the latest news about Vietnam's economy, and analyze which companies ({stock_check}) are likely to benefit from this news.
""".format_map({
    "website_check": ", ".join(website_check),
    "stock_check": ", ".join(stock_check)
})

browser_session = BrowserSession()
async def main():
    agent = Agent(
        task=task,
        llm=ChatOpenAI(model="gpt-4o"),
        browser_session=browser_session,
    )
    await agent.run()
    await browser_session.close()

asyncio.run(main())