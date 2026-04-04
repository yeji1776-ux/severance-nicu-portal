import { useState, useEffect, useCallback } from 'react';
import type { ElementType } from 'react';
import { getIcon } from '../lib/iconMap';

export interface ContentCategory {
  id: number;
  name: string;
  slug: string;
  icon_name: string;
  icon: ElementType;
  sort_order: number;
  is_journey_step: number;
  journey_step_order: number | null;
}

export interface ContentModule {
  id: number;
  title: string;
  icon_name: string;
  icon: ElementType;
  content: string;
  sort_order: number;
  warnings: string[] | null;
  alerts: string[] | null;
  links: { label: string; url: string }[] | null;
  images: { url: string; position: string; size: string; caption: string }[] | null;
  tag: string | null;
  status: string;
  category_slug: string;
}

export function useContentCategories(department?: string) {
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = department ? `?department=${department}` : '';
    fetch(`/api/content/categories${params}`)
      .then(r => r.json())
      .then(data => {
        setCategories(
          data.map((c: any) => ({
            ...c,
            icon: getIcon(c.icon_name),
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [department]);

  const journeySteps = categories
    .filter(c => c.is_journey_step)
    .sort((a, b) => (a.journey_step_order ?? 0) - (b.journey_step_order ?? 0))
    .map(c => ({ id: c.journey_step_order ?? c.sort_order, label: c.name, slug: c.slug }));

  return { categories, journeySteps, loading };
}

export function useContentModules(categorySlug: string | null, department?: string) {
  const [modules, setModules] = useState<ContentModule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchModules = useCallback(async () => {
    if (!categorySlug) { setModules([]); return; }
    setLoading(true);
    try {
      let url = `/api/content/modules?category=${categorySlug}&status=published`;
      if (department) url += `&department=${department}`;
      const r = await fetch(url);
      const data = await r.json();
      setModules(
        data.map((m: any) => ({
          ...m,
          icon: getIcon(m.icon_name),
          warnings: m.warnings ? JSON.parse(m.warnings) : null,
          alerts: m.alerts ? JSON.parse(m.alerts) : null,
          links: m.links ? JSON.parse(m.links) : null,
          images: m.images ? JSON.parse(m.images) : null,
        }))
      );
    } catch {
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, department]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return { modules, loading };
}
