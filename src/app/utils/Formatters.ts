export class Formatters {
  public static formatTextToHTML(value: any): string {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        // Format
        value[i] = Formatters.internalFormatTextToHTML(value[i]);
      }
    } else {
      // Format
      value = Formatters.internalFormatTextToHTML(value);
    }
    // Hack: Replace <anonymous> tag which is part of some Stack Trace to avoid hiding of the end of the detailed message!!!
    return value.replace('<anonymous>', 'anonymous');
  }

  private static internalFormatTextToHTML(value: any): string {
    // JSON?
    if (typeof value === 'object') {
      // Check that every values is parsed
      return Formatters.internalFormatTextToHTML(JSON.stringify(value));
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
