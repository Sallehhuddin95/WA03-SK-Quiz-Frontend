"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

export function FillBlankForm() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "jawapan_betul.jawapan_diterima",
  });

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">Jawapan Diterima</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append("")}
            disabled={fields.length >= 10}
          >
            <Plus className="mr-1 h-3 w-3" />
            Tambah Jawapan
          </Button>
        </div>

        {fields.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Tambah sekurang-kurangnya satu jawapan yang diterima.
          </p>
        )}

        <div className="grid gap-2">
          {fields.map((field, index) => (
            <FormField
              key={field.id}
              control={control}
              name={`jawapan_betul.jawapan_diterima.${index}`}
              render={({ field: inputField }) => (
                <FormItem>
                  <FormLabel className="sr-only">
                    Jawapan {index + 1}
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder={`Jawapan diterima ${index + 1}`}
                        {...inputField}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
