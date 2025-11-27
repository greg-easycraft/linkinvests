import { render, screen } from '~/test-utils/test-helpers';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from './table';

describe('Table Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Table', () => {
    it('should render a table element', () => {
      render(<Table data-testid="test-table" />);

      const table = screen.getByTestId('test-table');
      expect(table).toBeInTheDocument();
      expect(table.tagName).toBe('TABLE');
    });

    it('should have correct base styling', () => {
      render(<Table data-testid="test-table" />);

      const table = screen.getByTestId('test-table');
      expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm');
    });

    it('should be wrapped in a scrollable container', () => {
      render(<Table data-testid="test-table" />);

      const table = screen.getByTestId('test-table');
      const container = table.parentElement;
      expect(container).toHaveClass('relative', 'w-full', 'overflow-auto');
    });

    it('should apply custom className', () => {
      render(<Table data-testid="test-table" className="custom-class" />);

      const table = screen.getByTestId('test-table');
      expect(table).toHaveClass('custom-class');
    });

    it('should forward ref', () => {
      const ref = jest.fn();
      render(<Table ref={ref} />);

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLTableElement));
    });

    it('should spread additional props', () => {
      render(<Table data-testid="test-table" aria-label="Test table" />);

      const table = screen.getByTestId('test-table');
      expect(table).toHaveAttribute('aria-label', 'Test table');
    });
  });

  describe('TableHeader', () => {
    it('should render a thead element', () => {
      render(
        <table>
          <TableHeader data-testid="test-header" />
        </table>
      );

      const header = screen.getByTestId('test-header');
      expect(header).toBeInTheDocument();
      expect(header.tagName).toBe('THEAD');
    });

    it('should have correct styling', () => {
      render(
        <table>
          <TableHeader data-testid="test-header" />
        </table>
      );

      const header = screen.getByTestId('test-header');
      expect(header).toHaveClass('[&_tr]:border-b');
    });

    it('should apply custom className', () => {
      render(
        <table>
          <TableHeader data-testid="test-header" className="custom-class" />
        </table>
      );

      const header = screen.getByTestId('test-header');
      expect(header).toHaveClass('custom-class');
    });

    it('should forward ref', () => {
      const ref = jest.fn();
      render(
        <table>
          <TableHeader ref={ref} />
        </table>
      );

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLTableSectionElement));
    });
  });

  describe('TableBody', () => {
    it('should render a tbody element', () => {
      render(
        <table>
          <TableBody data-testid="test-body" />
        </table>
      );

      const body = screen.getByTestId('test-body');
      expect(body).toBeInTheDocument();
      expect(body.tagName).toBe('TBODY');
    });

    it('should have correct styling', () => {
      render(
        <table>
          <TableBody data-testid="test-body" />
        </table>
      );

      const body = screen.getByTestId('test-body');
      expect(body).toHaveClass('[&_tr:last-child]:border-0');
    });

    it('should apply custom className', () => {
      render(
        <table>
          <TableBody data-testid="test-body" className="custom-class" />
        </table>
      );

      const body = screen.getByTestId('test-body');
      expect(body).toHaveClass('custom-class');
    });

    it('should forward ref', () => {
      const ref = jest.fn();
      render(
        <table>
          <TableBody ref={ref} />
        </table>
      );

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLTableSectionElement));
    });
  });

  describe('TableFooter', () => {
    it('should render a tfoot element', () => {
      render(
        <table>
          <TableFooter data-testid="test-footer" />
        </table>
      );

      const footer = screen.getByTestId('test-footer');
      expect(footer).toBeInTheDocument();
      expect(footer.tagName).toBe('TFOOT');
    });

    it('should have correct styling', () => {
      render(
        <table>
          <TableFooter data-testid="test-footer" />
        </table>
      );

      const footer = screen.getByTestId('test-footer');
      expect(footer).toHaveClass(
        'border-t',
        'bg-neutral-100/50',
        'font-medium',
        '[&>tr]:last:border-b-0'
      );
    });

    it('should apply custom className', () => {
      render(
        <table>
          <TableFooter data-testid="test-footer" className="custom-class" />
        </table>
      );

      const footer = screen.getByTestId('test-footer');
      expect(footer).toHaveClass('custom-class');
    });

    it('should forward ref', () => {
      const ref = jest.fn();
      render(
        <table>
          <TableFooter ref={ref} />
        </table>
      );

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLTableSectionElement));
    });
  });

  describe('TableRow', () => {
    it('should render a tr element', () => {
      render(
        <table>
          <tbody>
            <TableRow data-testid="test-row" />
          </tbody>
        </table>
      );

      const row = screen.getByTestId('test-row');
      expect(row).toBeInTheDocument();
      expect(row.tagName).toBe('TR');
    });

    it('should have correct styling', () => {
      render(
        <table>
          <tbody>
            <TableRow data-testid="test-row" />
          </tbody>
        </table>
      );

      const row = screen.getByTestId('test-row');
      expect(row).toHaveClass(
        'border-b',
        'transition-colors',
        'hover:bg-neutral-100/50'
      );
    });

    it('should handle selection state', () => {
      render(
        <table>
          <tbody>
            <TableRow data-testid="test-row" data-state="selected" />
          </tbody>
        </table>
      );

      const row = screen.getByTestId('test-row');
      expect(row).toHaveAttribute('data-state', 'selected');
      expect(row).toHaveClass('data-[state=selected]:bg-neutral-100');
    });

    it('should apply custom className', () => {
      render(
        <table>
          <tbody>
            <TableRow data-testid="test-row" className="custom-class" />
          </tbody>
        </table>
      );

      const row = screen.getByTestId('test-row');
      expect(row).toHaveClass('custom-class');
    });

    it('should forward ref', () => {
      const ref = jest.fn();
      render(
        <table>
          <tbody>
            <TableRow ref={ref} />
          </tbody>
        </table>
      );

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLTableRowElement));
    });

    it('should handle click events', () => {
      const handleClick = jest.fn();
      render(
        <table>
          <tbody>
            <TableRow data-testid="test-row" onClick={handleClick} />
          </tbody>
        </table>
      );

      const row = screen.getByTestId('test-row');
      row.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('TableHead', () => {
    it('should render a th element', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead data-testid="test-head">Header</TableHead>
            </tr>
          </thead>
        </table>
      );

      const head = screen.getByTestId('test-head');
      expect(head).toBeInTheDocument();
      expect(head.tagName).toBe('TH');
      expect(head).toHaveTextContent('Header');
    });

    it('should have correct styling', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead data-testid="test-head">Header</TableHead>
            </tr>
          </thead>
        </table>
      );

      const head = screen.getByTestId('test-head');
      expect(head).toHaveClass(
        'h-12',
        'px-4',
        'text-left',
        'align-middle',
        'font-medium',
        'font-heading',
        ''
      );
    });

    it('should apply custom className', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead data-testid="test-head" className="custom-class">
                Header
              </TableHead>
            </tr>
          </thead>
        </table>
      );

      const head = screen.getByTestId('test-head');
      expect(head).toHaveClass('custom-class');
    });

    it('should forward ref', () => {
      const ref = jest.fn();
      render(
        <table>
          <thead>
            <tr>
              <TableHead ref={ref}>Header</TableHead>
            </tr>
          </thead>
        </table>
      );

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLTableCellElement));
    });

    it('should handle th-specific props', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead data-testid="test-head" scope="col" abbr="Abbreviation">
                Header
              </TableHead>
            </tr>
          </thead>
        </table>
      );

      const head = screen.getByTestId('test-head');
      expect(head).toHaveAttribute('scope', 'col');
      expect(head).toHaveAttribute('abbr', 'Abbreviation');
    });
  });

  describe('TableCell', () => {
    it('should render a td element', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell data-testid="test-cell">Cell Content</TableCell>
            </tr>
          </tbody>
        </table>
      );

      const cell = screen.getByTestId('test-cell');
      expect(cell).toBeInTheDocument();
      expect(cell.tagName).toBe('TD');
      expect(cell).toHaveTextContent('Cell Content');
    });

    it('should have correct styling', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell data-testid="test-cell">Cell Content</TableCell>
            </tr>
          </tbody>
        </table>
      );

      const cell = screen.getByTestId('test-cell');
      expect(cell).toHaveClass('p-4', 'align-middle');
    });

    it('should apply custom className', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell data-testid="test-cell" className="custom-class">
                Cell Content
              </TableCell>
            </tr>
          </tbody>
        </table>
      );

      const cell = screen.getByTestId('test-cell');
      expect(cell).toHaveClass('custom-class');
    });

    it('should forward ref', () => {
      const ref = jest.fn();
      render(
        <table>
          <tbody>
            <tr>
              <TableCell ref={ref}>Cell Content</TableCell>
            </tr>
          </tbody>
        </table>
      );

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLTableCellElement));
    });

    it('should handle td-specific props', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell data-testid="test-cell" colSpan={2} rowSpan={1}>
                Cell Content
              </TableCell>
            </tr>
          </tbody>
        </table>
      );

      const cell = screen.getByTestId('test-cell');
      expect(cell).toHaveAttribute('colSpan', '2');
      expect(cell).toHaveAttribute('rowSpan', '1');
    });
  });

  describe('TableCaption', () => {
    it('should render a caption element', () => {
      render(
        <table>
          <TableCaption data-testid="test-caption">Table Caption</TableCaption>
        </table>
      );

      const caption = screen.getByTestId('test-caption');
      expect(caption).toBeInTheDocument();
      expect(caption.tagName).toBe('CAPTION');
      expect(caption).toHaveTextContent('Table Caption');
    });

    it('should have correct styling', () => {
      render(
        <table>
          <TableCaption data-testid="test-caption">Table Caption</TableCaption>
        </table>
      );

      const caption = screen.getByTestId('test-caption');
      expect(caption).toHaveClass('mt-4', 'text-sm', '');
    });

    it('should apply custom className', () => {
      render(
        <table>
          <TableCaption data-testid="test-caption" className="custom-class">
            Table Caption
          </TableCaption>
        </table>
      );

      const caption = screen.getByTestId('test-caption');
      expect(caption).toHaveClass('custom-class');
    });

    it('should forward ref', () => {
      const ref = jest.fn();
      render(
        <table>
          <TableCaption ref={ref}>Table Caption</TableCaption>
        </table>
      );

      expect(ref).toHaveBeenCalledWith(expect.any(HTMLTableCaptionElement));
    });
  });

  describe('Complete Table', () => {
    it('should render a complete table structure', () => {
      render(
        <Table>
          <TableCaption>Test Table</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John</TableCell>
              <TableCell>30</TableCell>
            </TableRow>
            <TableRow data-state="selected">
              <TableCell>Jane</TableCell>
              <TableCell>25</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2}>Total: 2 people</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      expect(screen.getByText('Test Table')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('Total: 2 people')).toBeInTheDocument();
    });

    it('should be accessible', () => {
      render(
        <Table aria-label="User data">
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Name</TableHead>
              <TableHead scope="col">Age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John</TableCell>
              <TableCell>30</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );

      const table = screen.getByLabelText('User data');
      expect(table).toBeInTheDocument();
      expect(table).toHaveAttribute('aria-label', 'User data');

      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(2);
      headers.forEach(header => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });
  });
});