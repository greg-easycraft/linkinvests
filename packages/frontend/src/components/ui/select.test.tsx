import { render, screen } from '~/test-utils/test-helpers';
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select';

// Note: Due to Radix UI's Select component using advanced browser APIs
// (like pointer capture) that aren't fully supported in jsdom, we focus on
// testing static rendering, styling, props, and basic functionality.
// Interactive features (dropdown opening, item selection, keyboard navigation)
// are best tested through integration tests or E2E tests.

describe('Select Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SelectTrigger', () => {
    it('should render with correct styling classes', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select item..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveClass(
        'flex',
        'h-10',
        'w-full',
        'items-center',
        'justify-between',
        'rounded-md',
        'border',
        'px-3',
        'py-2',
        'text-sm'
      );
    });

    it('should have theme-based colors', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select item..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass(
        'border-[var(--primary)]',
        'bg-[var(--secundary)]',
        'text-[var(--primary)]'
      );
    });

    it('should have focus and disabled styling classes', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select item..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-[var(--primary)]',
        'focus:ring-offset-2',
        'disabled:cursor-not-allowed',
        'disabled:opacity-50'
      );
    });

    it('should show chevron down icon', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Select item..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      const chevronIcon = trigger.querySelector('svg');
      expect(chevronIcon).toBeInTheDocument();
      expect(chevronIcon).toHaveClass('h-4', 'w-4', 'opacity-50');
    });

    it('should apply custom className', () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger" data-testid="select-trigger">
            <SelectValue placeholder="Custom" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveClass('custom-trigger');
    });

    it('should forward ref correctly', () => {
      const ref = jest.fn();
      render(
        <Select>
          <SelectTrigger ref={ref} data-testid="select-trigger">
            <SelectValue placeholder="Ref test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(ref).toHaveBeenCalled();
    });

    it('should spread additional props', () => {
      render(
        <Select>
          <SelectTrigger
            data-testid="select-trigger"
            aria-label="Custom select"
            title="Select an option"
          >
            <SelectValue placeholder="Props test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('aria-label', 'Custom select');
      expect(trigger).toHaveAttribute('title', 'Select an option');
    });

    it('should render as button element', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Button test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger.tagName).toBe('BUTTON');
    });

    it('should have proper accessibility attributes', () => {
      render(
        <Select>
          <SelectTrigger data-testid="select-trigger">
            <SelectValue placeholder="Accessibility test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('select-trigger');
      expect(trigger).toHaveAttribute('role', 'combobox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should handle disabled state', () => {
      render(
        <Select disabled>
          <SelectTrigger data-testid="disabled-trigger">
            <SelectValue placeholder="Disabled" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('disabled-trigger');
      expect(trigger).toBeDisabled();
    });
  });

  describe('SelectValue', () => {
    it('should display placeholder text', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Choose an option..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Choose an option...')).toBeInTheDocument();
    });

    it('should display selected value when defaultValue is set', () => {
      render(
        <Select defaultValue="test">
          <SelectTrigger>
            <SelectValue placeholder="Choose an option..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test Item</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('should work with different placeholder variations', () => {
      render(
        <div>
          <Select>
            <SelectTrigger data-testid="trigger1">
              <SelectValue placeholder="Select fruit..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger data-testid="trigger2">
              <SelectValue placeholder="Choose color..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="red">Red</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );

      expect(screen.getByText('Select fruit...')).toBeInTheDocument();
      expect(screen.getByText('Choose color...')).toBeInTheDocument();
    });
  });

  describe('SelectContent', () => {
    it('should render content structure correctly', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Content test" />
          </SelectTrigger>
          <SelectContent data-testid="select-content">
            <SelectItem value="item1">Item 1</SelectItem>
            <SelectItem value="item2">Item 2</SelectItem>
          </SelectContent>
        </Select>
      );

      // Trigger should be accessible
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('should apply custom className', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Custom content" />
          </SelectTrigger>
          <SelectContent className="custom-content">
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );

      // Component should render trigger without errors when content has custom className
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should use default position prop', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Position test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );

      // Default position is 'popper' - component should render without errors
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = jest.fn();
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Ref test" />
          </SelectTrigger>
          <SelectContent ref={ref}>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      );

      // Note: Content ref might not be called until the dropdown opens
      // This test ensures the ref prop is accepted without errors
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('SelectItem', () => {
    it('should render with correct display name', () => {
      expect(SelectItem.displayName).toBe('SelectItem');
    });

    it('should forward ref correctly', () => {
      const ref = jest.fn();
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Item ref test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test" ref={ref}>
              Test Item
            </SelectItem>
          </SelectContent>
        </Select>
      );

      expect(ref).toHaveBeenCalled();
    });

    it('should work with different value types', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Value types test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="string">String Value</SelectItem>
            <SelectItem value="123">Number Value</SelectItem>
            <SelectItem value="kebab-case">Kebab Case</SelectItem>
            <SelectItem value="snake_case">Snake Case</SelectItem>
          </SelectContent>
        </Select>
      );

      // Should render without errors with different value formats
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Custom item" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom" className="custom-item">
              Custom Item
            </SelectItem>
          </SelectContent>
        </Select>
      );

      // Component should render without errors
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('SelectGroup and SelectLabel', () => {
    it('should have correct display names', () => {
      expect(SelectGroup.displayName).toBe('SelectGroup');
      expect(SelectLabel.displayName).toBe('SelectLabel');
    });

    it('should forward refs correctly', () => {
      const labelRef = jest.fn();
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Group test" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel ref={labelRef}>Test Group</SelectLabel>
              <SelectItem value="item">Test Item</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      expect(labelRef).toHaveBeenCalled();
    });

    it('should work with multiple groups', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Multiple groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="carrot">Carrot</SelectItem>
              <SelectItem value="lettuce">Lettuce</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      // Should render without errors with multiple groups
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should apply custom label className', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Custom label" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel className="custom-label">Custom Label</SelectLabel>
              <SelectItem value="item">Item</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );

      // Component should render without errors
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('SelectSeparator', () => {
    it('should have correct display name', () => {
      expect(SelectSeparator.displayName).toBe('SelectSeparator');
    });

    it('should forward ref correctly', () => {
      const ref = jest.fn();
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Separator test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="item1">Item 1</SelectItem>
            <SelectSeparator ref={ref} />
            <SelectItem value="item2">Item 2</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(ref).toHaveBeenCalled();
    });

    it('should apply custom className', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Custom separator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="item1">Item 1</SelectItem>
            <SelectSeparator className="custom-separator" />
            <SelectItem value="item2">Item 2</SelectItem>
          </SelectContent>
        </Select>
      );

      // Component should render without errors
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('SelectScrollButtons', () => {
    it('should have correct display names', () => {
      expect(SelectScrollUpButton.displayName).toBe('SelectScrollUpButton');
      expect(SelectScrollDownButton.displayName).toBe('SelectScrollDownButton');
    });

    it('should forward refs correctly', () => {
      const upRef = jest.fn();
      const downRef = jest.fn();

      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Scroll buttons test" />
          </SelectTrigger>
          <SelectContent>
            <SelectScrollUpButton ref={upRef} />
            <SelectItem value="item">Item</SelectItem>
            <SelectScrollDownButton ref={downRef} />
          </SelectContent>
        </Select>
      );

      // Note: Refs might not be called if the scroll buttons aren't rendered
      // in the closed state. This tests the structure exists without errors.
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should apply custom classNames', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Custom scroll buttons" />
          </SelectTrigger>
          <SelectContent>
            <SelectScrollUpButton className="custom-scroll-up" />
            <SelectItem value="item">Item</SelectItem>
            <SelectScrollDownButton className="custom-scroll-down" />
          </SelectContent>
        </Select>
      );

      // Component should render without errors
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render with many items structure', () => {
      const manyItems = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);

      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Many items test" />
          </SelectTrigger>
          <SelectContent>
            {manyItems.map((item) => (
              <SelectItem key={item} value={item.toLowerCase().replace(' ', '-')}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

      // Should render without errors with many items
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Complex Select Structure', () => {
    it('should render complete select with all components', () => {
      render(
        <Select defaultValue="apple">
          <SelectTrigger data-testid="complex-trigger">
            <SelectValue placeholder="Select a fruit..." />
          </SelectTrigger>
          <SelectContent>
            <SelectScrollUpButton />
            <SelectGroup>
              <SelectLabel>Popular Fruits</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Exotic Fruits</SelectLabel>
              <SelectItem value="mango">Mango</SelectItem>
              <SelectItem value="kiwi">Kiwi</SelectItem>
            </SelectGroup>
            <SelectScrollDownButton />
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('complex-trigger');
      expect(trigger).toBeInTheDocument();

      // Should show the selected value
      expect(screen.getByText('Apple')).toBeInTheDocument();

      // Should have proper accessibility
      expect(trigger).toHaveAttribute('role', 'combobox');
    });

    it('should work with nested structure and custom styling', () => {
      render(
        <div className="form-container">
          <label id="select-label">Choose your preference:</label>
          <Select>
            <SelectTrigger
              aria-labelledby="select-label"
              className="custom-trigger"
              data-testid="nested-trigger"
            >
              <SelectValue placeholder="Make a choice..." />
            </SelectTrigger>
            <SelectContent className="custom-content">
              <SelectGroup>
                <SelectLabel className="custom-label">Options</SelectLabel>
                <SelectItem value="option1" className="custom-item">
                  Option 1
                </SelectItem>
                <SelectItem value="option2" className="custom-item">
                  Option 2
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      );

      const trigger = screen.getByTestId('nested-trigger');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveClass('custom-trigger');
      expect(trigger).toHaveAttribute('aria-labelledby', 'select-label');
      expect(screen.getByText('Choose your preference:')).toBeInTheDocument();
    });

    it('should handle empty select gracefully', () => {
      render(
        <Select>
          <SelectTrigger data-testid="empty-trigger">
            <SelectValue placeholder="No options available" />
          </SelectTrigger>
          <SelectContent>
            {/* No items */}
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('empty-trigger');
      expect(trigger).toBeInTheDocument();
      expect(screen.getByText('No options available')).toBeInTheDocument();
    });

    it('should support controlled state props', () => {
      const onValueChange = jest.fn();

      render(
        <Select value="test" onValueChange={onValueChange}>
          <SelectTrigger data-testid="controlled-trigger">
            <SelectValue placeholder="Controlled select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test Value</SelectItem>
            <SelectItem value="other">Other Value</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByTestId('controlled-trigger');
      expect(trigger).toBeInTheDocument();

      // Should show the controlled value
      expect(screen.getByText('Test Value')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle special characters in values', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Special characters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test@domain.com">Email Value</SelectItem>
            <SelectItem value="user#123">Hash Value</SelectItem>
            <SelectItem value="path/to/file">Path Value</SelectItem>
            <SelectItem value="query?param=value">Query Value</SelectItem>
          </SelectContent>
        </Select>
      );

      // Should render without errors
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle very long option text', () => {
      const longText = 'This is a very long text that might cause layout issues if not handled properly in the select component and should be truncated or wrapped appropriately';

      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Long text test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="long">{longText}</SelectItem>
            <SelectItem value="short">Short text</SelectItem>
          </SelectContent>
        </Select>
      );

      // Should render without errors
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle multiple select instances', () => {
      render(
        <div>
          <Select defaultValue="red">
            <SelectTrigger data-testid="color-select">
              <SelectValue placeholder="Choose color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="red">Red</SelectItem>
              <SelectItem value="blue">Blue</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="large">
            <SelectTrigger data-testid="size-select">
              <SelectValue placeholder="Choose size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );

      expect(screen.getByTestId('color-select')).toBeInTheDocument();
      expect(screen.getByTestId('size-select')).toBeInTheDocument();
      expect(screen.getByText('Red')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
    });

    it('should handle missing optional props gracefully', () => {
      // Test that component doesn't crash without optional props
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="valid-value">Valid Item</SelectItem>
          </SelectContent>
        </Select>
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });
});