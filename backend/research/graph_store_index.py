from llama_index.core import SimpleDirectoryReader
from llama_index.graph_stores.neo4j import Neo4jPropertyGraphStore

graph_store = Neo4jPropertyGraphStore(
    username="neo4j",
    password="neo4j_pass",
    url="bolt://localhost:7687",
)

documents = SimpleDirectoryReader("./data/").load_data()

from llama_index.core import PropertyGraphIndex
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.llms.openai import OpenAI
from llama_index.core.indices.property_graph import SchemaLLMPathExtractor

index = PropertyGraphIndex.from_documents(
    documents,
    embed_model=OpenAIEmbedding(model_name="text-embedding-3-small"),
    kg_extractors=[
        SchemaLLMPathExtractor(
            llm=OpenAI(model="gpt-3.5-turbo", temperature=0.0)
        )
    ],
    property_graph_store=graph_store,
    show_progress=True,
)