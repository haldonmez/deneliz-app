from django.apps import AppConfig
class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'

    def ready(self):
        import logging
        logger = logging.getLogger(__name__)
        logger.info("CoreConfig ready() started.")

        from .ai_service import AIService
        try:
            ai_service = AIService()
            ai_service.initialize()
            logger.info("AIService successfully initialized in ready().")
        except Exception as e:
            logger.error(f"AIService initialization failed in ready(): {e}")