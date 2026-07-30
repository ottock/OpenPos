import time
import random
import logging
from functools import wraps

log = logging.getLogger(__name__)


def _retry(max_retries, exceptions, delay_for):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_retries+1):
                try:
                    return func(*args, **kwargs)
                except exceptions as exc:
                    if attempt == max_retries:
                        log.error(
                            "%s failed after %d attempts.",
                            func.__name__,
                            max_retries,
                        )
                        raise
                    delay = delay_for(attempt)
                    log.warning(
                        "%s failed (attempt %d/%d): %s. Retrying in %.1fs...",
                        func.__name__,
                        attempt,
                        max_retries,
                        exc,
                        delay,
                    )
                    time.sleep(delay)
        return wrapper
    return decorator


def retry_constant(max_retries=3, delay=1, exceptions=(Exception,), jitter=0):
    return _retry(
        max_retries,
        exceptions,
        lambda _: delay + random.uniform(0, jitter),
    )


def retry_linear(max_retries=3, delay=1, exceptions=(Exception,), jitter=0):
    return _retry(
        max_retries,
        exceptions,
        lambda attempt: delay * attempt + random.uniform(0, jitter),
    )