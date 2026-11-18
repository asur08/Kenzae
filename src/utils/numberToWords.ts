/**
 * Converts a number into Indian Rupee currency words format (Lakhs, Crores).
 * e.g., 12850 -> "Twelve Thousand Eight Hundred and Fifty Only"
 */
export function convertAmountToWords(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'Zero Rupees Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertSection(num: number): string {
    let str = '';
    if (num > 99) {
      str += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num > 19) {
      str += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    if (num > 0) {
      str += ones[num] + ' ';
    }
    return str.trim();
  }

  let words = '';
  let n = rounded;

  const crores = Math.floor(n / 10000000);
  n %= 10000000;
  if (crores > 0) {
    words += convertSection(crores) + ' Crore ';
  }

  const lakhs = Math.floor(n / 100000);
  n %= 100000;
  if (lakhs > 0) {
    words += convertSection(lakhs) + ' Lakh ';
  }

  const thousands = Math.floor(n / 1000);
  n %= 1000;
  if (thousands > 0) {
    words += convertSection(thousands) + ' Thousand ';
  }

  if (n > 0) {
    words += convertSection(n) + ' ';
  }

  return `${words.trim()} Rupees Only`;
}
