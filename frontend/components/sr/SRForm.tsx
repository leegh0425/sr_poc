"use client"


import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

import { COMPANIES, SYSTEMS, ASSIGNEES, REQUEST_TYPES } from "@/lib/constants"
import { mapRequestTypeToCategory } from "@/lib/mappers"
import { submitSR } from "@/lib/api"

const formSchema = z
  .object({
    company: z.string().min(1, "소속회사를 선택해주세요"),
    team: z.string().min(1, "소속 부서/팀을 입력해주세요"),
    requester: z.string().min(1, "요청자 이름을 입력해주세요"),
    title: z.string().min(1, "제목을 입력해주세요"),
    system: z.string().min(1, "시스템을 선택해주세요"),
    assignee: z.string().min(1, "시스템 담당자를 선택해주세요"),
    requestType: z.string().min(1, "요청 구분을 선택해주세요"),
  requestDate: z.date({
    error: () => ({ message: "요청일자를 선택해주세요" }),
  }),
    dueDate: z.date().optional().nullable(),
    description: z.string().min(10, "상세 내용은 최소 10자 이상 입력해주세요"),
    attachmentUrl: z.string().url("올바른 URL을 입력해주세요").optional().or(z.literal("")),
    replyEmail: z.string().email("올바른 이메일 주소를 입력해주세요").optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.dueDate && data.requestDate) {
        return data.dueDate >= data.requestDate
      }
      return true
    },
    {
      message: "완료일자는 요청일자보다 같거나 이후여야 합니다",
      path: ["dueDate"],
    },
  )

type FormData = z.infer<typeof formSchema>

const STORAGE_KEY = "daiso-sr-draft"

export function SRForm() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successData, setSuccessData] = useState<{ ticketId: string; status: string } | null>(null)
  const [progress, setProgress] = useState(0)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "",
      team: "",
      requester: "",
      title: "",
      system: "",
      assignee: "",
      requestType: "",
      requestDate: new Date(),
      dueDate: null,
      description: "",
      attachmentUrl: "",
      replyEmail: "",
    },
  })

  const watchedFields = form.watch()

  // Calculate progress
  useEffect(() => {
    const requiredFields = ["company", "team", "requester", "title", "system", "assignee", "requestType", "description"]
    const filledCount = requiredFields.filter((field) => watchedFields[field as keyof FormData]).length
    setProgress(Math.round((filledCount / requiredFields.length) * 100))
  }, [watchedFields])

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedFields))
    }, 1000)
    return () => clearTimeout(timer)
  }, [watchedFields])

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.requestDate) {
          data.requestDate = new Date(data.requestDate)
        }
        if (data.dueDate) {
          data.dueDate = new Date(data.dueDate)
        }
        form.reset(data)
      } catch (e) {
        console.error("Failed to restore draft", e)
      }
    }
  }, [form])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

    try {
      const payload = {
        title: data.title,
        team: data.team,
        assignee: data.assignee,
        description: data.description,
        category: mapRequestTypeToCategory(data.requestType as any),
        priority: "보통",
        system_name: data.system,
        request_date: format(data.requestDate, "yyyy-MM-dd"),
        requester: data.requester,
        summary: null,
        attachment_url: data.attachmentUrl || null,
        due_date: data.dueDate ? format(data.dueDate, "yyyy-MM-dd") : null,
        reply_email: data.replyEmail || null,
      }

      const response = await submitSR(payload)

      setSuccessData({
        ticketId: response.ticket_id,
        status: response.status,
      })

      localStorage.removeItem(STORAGE_KEY)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "제출 실패",
        description: error.message || "서버 오류가 발생했습니다. 다시 시도해주세요.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNewRequest = () => {
    setSuccessData(null)
    form.reset({
      company: "",
      team: "",
      requester: "",
      title: "",
      system: "",
      assignee: "",
      requestType: "",
      requestDate: new Date(),
      dueDate: null,
      description: "",
      attachmentUrl: "",
      replyEmail: "",
    })
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">작성 진행률123123123123213</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Basic Info Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              기본 정보
            </Badge>
            <Separator className="flex-1" />
          </div>

          {/* Company */}
          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium">
              소속회사 <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={form.watch("company")}
              onValueChange={(value) => form.setValue("company", value)}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3"
            >
              {COMPANIES.map((company) => (
                <div key={company} className="flex items-center space-x-2">
                  <RadioGroupItem value={company} id={company} />
                  <Label htmlFor={company} className="cursor-pointer text-sm font-normal">
                    {company}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {form.formState.errors.company && (
              <p className="text-sm text-destructive">{form.formState.errors.company.message}</p>
            )}
          </div>

          {/* Team & Requester */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="team" className="text-sm font-medium">
                소속 부서/팀 <span className="text-destructive">*</span>
              </Label>
              <Input id="team" placeholder="예: IT개발팀" {...form.register("team")} />
              {form.formState.errors.team && (
                <p className="text-sm text-destructive">{form.formState.errors.team.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requester" className="text-sm font-medium">
                요청자 이름 <span className="text-destructive">*</span>
              </Label>
              <Input id="requester" placeholder="홍길동" {...form.register("requester")} />
              {form.formState.errors.requester && (
                <p className="text-sm text-destructive">{form.formState.errors.requester.message}</p>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              제목 <span className="text-destructive">*</span>
            </Label>
            <Input id="title" placeholder="간단하고 명확한 제목을 입력해주세요" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>
        </div>

        {/* System Info Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              시스템 정보
            </Badge>
            <Separator className="flex-1" />
          </div>

          {/* System Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              시스템 선택 <span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn("w-full justify-between", !form.watch("system") && "text-muted-foreground")}
                >
                  {form.watch("system") || "시스템을 선택하세요"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="시스템 검색..." />
                  <CommandList>
                    <CommandEmpty>결과가 없습니다.</CommandEmpty>
                    <CommandGroup>
                      {SYSTEMS.map((system) => (
                        <CommandItem key={system} value={system} onSelect={() => form.setValue("system", system)}>
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              form.watch("system") === system ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {system}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {form.formState.errors.system && (
              <p className="text-sm text-destructive">{form.formState.errors.system.message}</p>
            )}
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              시스템 담당자 <span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn("w-full justify-between", !form.watch("assignee") && "text-muted-foreground")}
                >
                  {form.watch("assignee") || "담당자를 선택하세요"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="담당자 검색..." />
                  <CommandList>
                    <CommandEmpty>결과가 없습니다.</CommandEmpty>
                    <CommandGroup>
                      {ASSIGNEES.map((assignee) => (
                        <CommandItem
                          key={assignee.email}
                          value={`${assignee.name} ${assignee.email}`}
                          onSelect={() => form.setValue("assignee", assignee.name)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              form.watch("assignee") === assignee.name ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{assignee.name}</span>
                            <span className="text-xs text-muted-foreground">{assignee.email}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {form.formState.errors.assignee && (
              <p className="text-sm text-destructive">{form.formState.errors.assignee.message}</p>
            )}
          </div>
        </div>

        {/* Request Details Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              요청 상세
            </Badge>
            <Separator className="flex-1" />
          </div>

          {/* Request Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              요청 구분 <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={form.watch("requestType")}
              onValueChange={(value) => form.setValue("requestType", value)}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3"
            >
              {REQUEST_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={type} />
                  <Label htmlFor={type} className="cursor-pointer text-sm font-normal">
                    {type}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {form.formState.errors.requestType && (
              <p className="text-sm text-destructive">{form.formState.errors.requestType.message}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                요청일자 <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("requestDate") && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("requestDate") ? format(form.watch("requestDate"), "PPP", { locale: ko }) : "날짜 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("requestDate")}
                    onSelect={(date) => form.setValue("requestDate", date!)}
                    locale={ko}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.requestDate && (
                <p className="text-sm text-destructive">{form.formState.errors.requestDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">완료일자 (선택)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("dueDate") && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("dueDate") ? format(form.watch("dueDate")!, "PPP", { locale: ko }) : "날짜 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("dueDate") || undefined}
                    onSelect={(date) => form.setValue("dueDate", date || null)}
                    locale={ko}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.dueDate && (
                <p className="text-sm text-destructive">{form.formState.errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              상세 내용 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="문제 상황이나 요청 사항을 상세히 설명해주세요 (최소 10자)"
              className="min-h-[120px] resize-none"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Attachment URL */}
          <div className="space-y-2">
            <Label htmlFor="attachmentUrl" className="text-sm font-medium">
              첨부 URL (선택)
            </Label>
            <Input
              id="attachmentUrl"
              type="url"
              placeholder="https://drive.google.com/..."
              {...form.register("attachmentUrl")}
            />
            {form.formState.errors.attachmentUrl && (
              <p className="text-sm text-destructive">{form.formState.errors.attachmentUrl.message}</p>
            )}
          </div>

          {/* Reply Email */}
          <div className="space-y-2">
            <Label htmlFor="replyEmail" className="text-sm font-medium">
              답변 받을 메일 주소 (선택)
            </Label>
            <Input id="replyEmail" type="email" placeholder="example@daiso.com" {...form.register("replyEmail")} />
            {form.formState.errors.replyEmail && (
              <p className="text-sm text-destructive">{form.formState.errors.replyEmail.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button - Desktop */}
        <div className="hidden md:block">
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-[#C80010]"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                제출 중...
              </>
            ) : (
              "요청 제출하기"
            )}
          </Button>
        </div>
      </form>

      {/* Sticky Submit Bar - Mobile */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background p-4 shadow-lg md:hidden">
        <Button
          onClick={form.handleSubmit(onSubmit)}
          className="w-full bg-primary text-primary-foreground hover:bg-[#C80010]"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              제출 중...
            </>
          ) : (
            "요청 제출하기"
          )}
        </Button>
      </div>

      {/* Success Dialog */}
      <Dialog open={!!successData} onOpenChange={() => setSuccessData(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#10B981]/10">
              <Check className="h-6 w-6 text-[#10B981]" />
            </div>
            <DialogTitle className="text-center text-2xl">요청이 접수되었습니다</DialogTitle>
            <DialogDescription className="text-center">
              티켓 번호를 확인하시고 진행 상황을 추적하실 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="mb-1 text-sm text-muted-foreground">티켓 번호</p>
              <p className="text-2xl font-bold text-foreground">{successData?.ticketId}</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">상태:</span>
              <Badge variant="outline">{successData?.status}</Badge>
            </div>
            <Button onClick={handleNewRequest} className="w-full bg-primary text-primary-foreground hover:bg-[#C80010]">
              새 요청 작성
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
