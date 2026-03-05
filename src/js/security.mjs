function decodeEntities(value) {
  return String(value || '')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'");
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function purifier() {
  if (globalThis.DOMPurify && typeof globalThis.DOMPurify.sanitize === 'function') {
    return globalThis.DOMPurify;
  }

  return null;
}

export function sanitizeInputText(rawText) {
  var activePurifier = purifier();
  if (!activePurifier) {
    return decodeEntities(String(rawText || '').replace(/<[^>]*>/g, ''));
  }

  var withoutTags = activePurifier.sanitize(String(rawText || ''), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });

  return decodeEntities(withoutTags);
}

export function sanitizeChatHtml(rawHtml) {
  var activePurifier = purifier();
  if (!activePurifier) {
    return escapeHtml(rawHtml);
  }

  return activePurifier.sanitize(String(rawHtml || ''), {
    ALLOWED_TAGS: ['a', 'b', 'br', 'div', 'em', 'i', 'img', 'li', 'span', 'strong', 'ul'],
    ALLOWED_ATTR: ['alt', 'class', 'href', 'rel', 'src', 'style', 'target', 'title'],
    ALLOW_DATA_ATTR: false
  });
}
