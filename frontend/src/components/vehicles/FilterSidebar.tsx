import { Paper, TextInput, Checkbox, Stack, Text, Slider, Group, Anchor, Select } from '@mantine/core';
import { formatCurrency } from '../../utils/dateUtils';

export type CatalogSort =
  | 'price-asc'
  | 'price-desc'
  | 'year-asc'
  | 'year-desc'
  | 'brand-asc';

export interface CatalogFilters {
  search: string;
  types: string[];
  brands: string[];
  models: string[];
  driveTypes: string[];
  maxPrice: number;
  sort: CatalogSort;
}

const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'year-asc', label: 'Year: oldest first' },
  { value: 'year-desc', label: 'Year: newest first' },
  { value: 'brand-asc', label: 'Brand: A–Z' },
];

interface FilterSidebarProps {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  options: { types: string[]; brands: string[]; models: string[]; driveTypes: string[] };
  priceBounds: { min: number; max: number };
  onReset: () => void;
}

const CheckboxGroup = ({
  title,
  values,
  selected,
  onChange,
}: {
  title: string;
  values: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) => {
  if (values.length === 0) return null;
  return (
    <Checkbox.Group value={selected} onChange={onChange} label={title}>
      <Stack gap={6} mt={6}>
        {values.map((v) => (
          <Checkbox key={v} value={v} label={v} size="sm" />
        ))}
      </Stack>
    </Checkbox.Group>
  );
};

export const FilterSidebar = ({ filters, onChange, options, priceBounds, onReset }: FilterSidebarProps) => (
  <Paper radius="lg" p="lg" shadow="sm" withBorder>
    <Stack gap="lg">
      {/* prominent search input pill */}
      <TextInput
        radius="xl"
        size="md"
        placeholder="Search make or model…"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.currentTarget.value })}
      />

      <CheckboxGroup
        title="Type"
        values={options.types}
        selected={filters.types}
        onChange={(types) => onChange({ ...filters, types })}
      />
      <CheckboxGroup
        title="Make"
        values={options.brands}
        selected={filters.brands}
        onChange={(brands) => onChange({ ...filters, brands })}
      />
      <CheckboxGroup
        title="Model"
        values={options.models}
        selected={filters.models}
        onChange={(models) => onChange({ ...filters, models })}
      />
      <CheckboxGroup
        title="Drive"
        values={options.driveTypes}
        selected={filters.driveTypes}
        onChange={(driveTypes) => onChange({ ...filters, driveTypes })}
      />

      <Select
        label="Sort by"
        data={SORT_OPTIONS}
        value={filters.sort}
        onChange={(sort) => onChange({ ...filters, sort: (sort as CatalogSort) ?? 'price-asc' })}
      />

      {/* price range slider */}
      <Stack gap={6}>
        <Text size="sm" fw={500}>
          Max price / day
        </Text>
        <Slider
          color="dark"
          min={priceBounds.min}
          max={priceBounds.max}
          value={filters.maxPrice}
          onChange={(maxPrice) => onChange({ ...filters, maxPrice })}
          label={(v) => formatCurrency(v)}
        />
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {formatCurrency(priceBounds.min)}
          </Text>
          <Text size="xs" fw={600}>
            up to {formatCurrency(filters.maxPrice)}
          </Text>
        </Group>
      </Stack>

      <Anchor component="button" type="button" size="sm" c="dimmed" onClick={onReset}>
        Reset filters
      </Anchor>
    </Stack>
  </Paper>
);
