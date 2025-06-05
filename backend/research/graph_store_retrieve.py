from llama_index.graph_stores.neo4j import Neo4jPropertyGraphStore
from llama_index.core import PropertyGraphIndex
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI

graph_store = Neo4jPropertyGraphStore(
    username="neo4j",
    password="794613852",
    url="bolt://localhost:7687",
)

index = PropertyGraphIndex.from_existing(
    property_graph_store=graph_store,
    llm=OpenAI(model="gpt-4", temperature=0.3),
    embed_model=OpenAIEmbedding(model_name="text-embedding-3-small"),
)