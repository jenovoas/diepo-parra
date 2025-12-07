import { render, screen } from '@testing-library/react';
import { PaymentButton } from '@/components/ui/PaymentButton';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

describe('PaymentButton', () => {
  it('renderiza el botón de pago', () => {
    render(<PaymentButton price="$10.000" />);
    expect(screen.getByText(/Pagar Online/)).toBeInTheDocument();
  });
});
