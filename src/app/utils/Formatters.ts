
export class Formatters {
  public static formatTextToHTML(value: any): string {
    // Check
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        // Format
        value[i] = Formatters._formatTextToHTML(value[i]);
      }
    } else {
      // Format
      value = Formatters._formatTextToHTML(value);
    }
    // Hack: Replace <anonymous> tag which is part of some Stack Trace to avoi hiding of the end of the detailed message!!!
    return value.replace('<anonymous>', 'anonymous');
  }

  private static _formatTextToHTML(value: any): string {
    // JSON?
    if (typeof value === 'object') {
      // Check that every values is parsed
      return Formatters._formatTextToHTML(JSON.stringify(value));
      // String?
    } else if (typeof value === 'string') {
      let parsedValue: string;
      try {
        // Try to parse and format it
        parsedValue = JSON.stringify(JSON.parse(value), null, 6);
        // Ok: Format
        parsedValue = parsedValue
          .replace(/</g, '&lt')
          .replace(/>/g, '&gt')
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
      return value + '';
    }
  }
}
