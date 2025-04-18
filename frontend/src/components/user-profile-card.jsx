// frontend/src/components/user-profile-card.jsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import Link from "next/link"

export function UserProfileCard({ user }) {
  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="pb-2 pt-6 text-center">
        <div className="mx-auto mb-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.profileImage} alt={user.fullName} />
            <AvatarFallback className="text-xl">{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>
        </div>
        <h3 className="text-xl font-bold">{user.fullName}</h3>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        {user.bio && (
          <p className="mt-2 text-sm">{user.bio}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="mt-2">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/profile">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}