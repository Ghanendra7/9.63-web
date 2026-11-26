import React, { useCallback } from "react";
import { Checkbox, Flex, Grid, Text } from "@sanity/ui";
import { set, unset, type ArrayOfPrimitivesInputProps } from "sanity";
import { JOURNAL_CATEGORY_OPTIONS } from "../schemaTypes/journal";

export function TwoColumnCategoriesInput(props: ArrayOfPrimitivesInputProps<string>) {
  const { value = [], onChange, readOnly } = props;

  const handleToggle = useCallback(
    (category: string) => {
      if (readOnly) return;
      const exists = value.includes(category);
      const next = exists
        ? value.filter((item) => item !== category)
        : [...value, category];

      onChange(next.length > 0 ? set(next) : unset());
    },
    [value, onChange, readOnly]
  );

  return (
    <Grid columns={2} gap={3}>
      {JOURNAL_CATEGORY_OPTIONS.map((option) => {
        const checked = value.includes(option.value);
        return (
          <Flex
            key={option.value}
            as="label"
            align="center"
            gap={2}
            style={{ cursor: readOnly ? "default" : "pointer" }}
          >
            <Checkbox
              checked={checked}
              disabled={readOnly}
              onChange={() => handleToggle(option.value)}
            />
            <Text size={1}>{option.title}</Text>
          </Flex>
        );
      })}
    </Grid>
  );
}
