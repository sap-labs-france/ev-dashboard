export class Formatters {

  public static formatTextToHTML(value): String {
    // Check
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        // Format
        value[i] = this._formatTextToHTML(value[i]);
      }
    } else {
      // Format
      value = this._formatTextToHTML(value);
    }
    return value;
  }

  private static _formatTextToHTML(value) {
    // JSON?
    if (typeof value === 'object') {
      // Check that every values is parsed
      return this._formatTextToHTML(JSON.stringify(value));
      // String?
    } else if (typeof value === 'string') {
      let parsedValue;
      try {
        // Try to parse it
        parsedValue = JSON.stringify(JSON.parse(value), null, 6);
        // Ok: Format
        parsedValue = parsedValue
          .replace(/\n/g, '<br/>')
          .replace(/\\n\s/g, '<br/>')
          .replace(/\s/g, '&nbsp;');
      } catch (err) {
        // Err: Apply default formatting
        parsedValue = value.replace(/ /g, '&nbsp;').replace(/\n/g, '<br/>');
      }
      // Replace
      return parsedValue;
    } else {
      // Unknown
      return value;
    }
  }
}
