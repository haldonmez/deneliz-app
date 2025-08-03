# core/ai_service.py

from langchain import PromptTemplate
from langchain.chains import RetrievalQA
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores.chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from google.oauth2 import service_account
from django.conf import settings
import os
import logging

logger = logging.getLogger(__name__)

class AIService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def initialize(self):
        if self._initialized:
            return

        try:
            # Configure credentials
            service_account_file = os.path.join(settings.BASE_DIR, 'core', 'key', 'service_account_key.json')
            credentials = service_account.Credentials.from_service_account_file(service_account_file)

            # Initialize AI model
            self.model = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                google_api_key=None,
                temperature=0.2,
                convert_system_message_to_human=True,
                credentials=credentials
            )

            # Initialize embeddings
            self.embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=None,
                credentials=credentials
            )

            # Load and process PDF
            pdf_path = os.path.join(settings.BASE_DIR, 'core', 'key', '24095558_2024_yks.pdf')
            pdf_loader = PyPDFLoader(pdf_path)
            pages = pdf_loader.load_and_split()

            # Process text
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
            context = "\n\n".join(str(p.page_content) for p in pages)
            texts = text_splitter.split_text(context)

            # Initialize vector store
            self.vector_index = Chroma.from_texts(texts, self.embeddings).as_retriever(search_kwargs={"k": 5})

            # Setup QA chain
            template = """ 
            Sondaki soruyu yanıtlamak için aşağıdaki bağlam parçalarını kullanın. 
            Eğer cevabı bilmiyorsanız, sadece bilmediğinizi söyleyin; bir cevap uydurmaya çalışmayın. 
            Kazanımlar içinden bir veya çok sayıda kazanımı verilen soruyla eşleştirin.
            Cevabınızı mümkün olduğunca kısa tutun.
            Her zaman türkçe dilini kullan.

            {context}
            Question: {question}
            Helpful Answer:"""

            prompt = PromptTemplate.from_template(template)

            self.qa_chain = RetrievalQA.from_chain_type(
                self.model,
                retriever=self.vector_index,
                return_source_documents=True,
                chain_type_kwargs={"prompt": prompt}
            )

            self._initialized = True
            logger.info("AIService initialized successfully.")

        except Exception as e:
            logger.error(f"Error during initialization: {str(e)}")
            raise

    def get_qa_chain(self):
        if not self._initialized:
            raise Exception("AIService is not initialized")
        return self.qa_chain
