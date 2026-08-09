import time
import random
import logging


log = logging.getLogger(__name__)


def linear_retry(max_retries=3, delay=2, step=0, exceptions=(Exception,), jitter=0):
    def decorator(func):
        def run(*args, **kwargs):
            for attempt in range(1, max_retries + 1):
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

                    wait = delay + step * (attempt - 1) + random.uniform(0, jitter)
                    log.warning(
                        "%s failed (attempt %d/%d): %s. Retrying in %.1fs...",
                        func.__name__,
                        attempt,
                        max_retries,
                        exc,
                        wait,
                    )
                    time.sleep(wait)
        return run
    return decorator