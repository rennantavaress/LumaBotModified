data "aws_caller_identity" "current" {}
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

# ─── IAM Role para EC2 (SSM, CloudWatch) ─────────────────────────────────────

resource "aws_iam_role" "luma_bot_ec2" {
  name = "LumaBotEC2Role"
  path = "/"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
  ]
}

resource "aws_iam_instance_profile" "luma_bot_ec2" {
  name = "LumaBotEC2InstanceProfile"
  role = aws_iam_role.luma_bot_ec2.name
}

# ─── OIDC Role para GitHub Actions ───────────────────────────────────────────

resource "aws_iam_role" "luma_bot_gh_actions" {
  name = "LumaBotGHActionsRole"
  path = "/"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = data.aws_iam_openid_connect_provider.github.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:${var.github_repo}:ref:refs/heads/monteiro/bulma-ec2"
        }
      }
    }]
  })
}

resource "aws_iam_policy" "luma_bot_deploy" {
  name        = "LumaBotDeployPolicy"
  description = "Policy for GitHub Actions to deploy LumaBot"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances",
          "ec2:DescribeInstanceStatus",
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:SendCommand",
          "ssm:GetCommandInvocation",
        ]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*",
        ]
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "luma_bot_deploy" {
  role       = aws_iam_role.luma_bot_gh_actions.name
  policy_arn = aws_iam_policy.luma_bot_deploy.arn
}
